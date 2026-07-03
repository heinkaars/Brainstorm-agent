import type { EvaluatedIdea, IdeaInput } from "./types";

const SYSTEM_PROMPT = `You are a seasoned Hackathon Evaluator — a tough but fair judge who pressure-tests startup ideas.

Evaluate each idea on four dimensions (0–100 each):
- painClarity: Is the pain specific? Who feels it, how often, how badly?
- marketFit: Is the target segment well-defined and reachable?
- riskProfile: Higher score = risks are manageable or well-mitigated. Lower = fatal flaws.
- ideaStrength: Is the one-liner compelling, clear, and actionable?

Rules:
- Be critical. Most hackathon ideas should NOT all get SHIP IT.
- verdict must be exactly "SHIP IT" or "SKIP IT".
- SHIP IT only for ideas scoring 65+ overall with no fatal flaws.
- Assign rank 1 to the strongest idea, ascending for weaker ones.
- rationale: 1–2 sentences explaining the verdict (direct, no fluff).
- overall score = round(painClarity*0.3 + marketFit*0.25 + riskProfile*0.2 + ideaStrength*0.25)

Return ONLY valid JSON matching this schema:
{
  "evaluations": [
    {
      "id": "<must match input id>",
      "score": <number 0-100>,
      "rank": <number starting at 1>,
      "verdict": "SHIP IT" | "SKIP IT",
      "rationale": "<string>",
      "scores": {
        "painClarity": <number>,
        "marketFit": <number>,
        "riskProfile": <number>,
        "ideaStrength": <number>
      }
    }
  ]
}`;

interface AIEvaluationItem {
  id: string;
  score: number;
  rank: number;
  verdict: "SHIP IT" | "SKIP IT";
  rationale: string;
  scores: EvaluatedIdea["scores"];
}

interface AIResponse {
  evaluations: AIEvaluationItem[];
}

export class AIEvaluatorError extends Error {
  constructor(
    message: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = "AIEvaluatorError";
  }
}

export async function evaluateIdeasWithAI(
  ideas: IdeaInput[]
): Promise<EvaluatedIdea[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIEvaluatorError(
      "OPENAI_API_KEY is not configured. Add it to .env.local and restart the server.",
      503
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const userPrompt = JSON.stringify(
    ideas.map(({ id, idea, pain, risk, segment }) => ({
      id,
      idea,
      pain,
      biggestRisk: risk,
      segment,
    })),
    null,
    2
  );

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Evaluate and rank these ${ideas.length} hackathon idea(s):\n\n${userPrompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    let detail = body;
    try {
      const parsed = JSON.parse(body);
      detail = parsed.error?.message ?? body;
    } catch {
      // keep raw body
    }
    throw new AIEvaluatorError(
      `OpenAI API error (${response.status}): ${detail}`,
      response.status === 401 ? 401 : 502
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new AIEvaluatorError("OpenAI returned an empty response.", 502);
  }

  let parsed: AIResponse;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new AIEvaluatorError("Failed to parse AI response as JSON.", 502);
  }

  if (!Array.isArray(parsed.evaluations)) {
    throw new AIEvaluatorError("AI response missing evaluations array.", 502);
  }

  const ideaMap = new Map(ideas.map((i) => [i.id, i]));

  const results: EvaluatedIdea[] = parsed.evaluations
    .filter((e) => ideaMap.has(e.id))
    .map((e) => {
      const original = ideaMap.get(e.id)!;
      return {
        ...original,
        score: clamp(Math.round(e.score), 0, 100),
        rank: e.rank,
        verdict: e.verdict === "SHIP IT" ? "SHIP IT" : "SKIP IT",
        rationale: e.rationale,
        scores: {
          painClarity: clamp(Math.round(e.scores?.painClarity ?? 0), 0, 100),
          marketFit: clamp(Math.round(e.scores?.marketFit ?? 0), 0, 100),
          riskProfile: clamp(Math.round(e.scores?.riskProfile ?? 0), 0, 100),
          ideaStrength: clamp(Math.round(e.scores?.ideaStrength ?? 0), 0, 100),
        },
      };
    });

  results.sort((a, b) => a.rank - b.rank);

  // Re-assign ranks in case AI returned gaps or duplicates
  return results.map((r, i) => ({ ...r, rank: i + 1 }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
