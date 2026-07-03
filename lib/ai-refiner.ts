import type { IdeaInput, RefineSuggestion } from "./types";

const SYSTEM_PROMPT = `You are a provocative Hackathon Coach — blunt, direct, and allergic to vague startup speak.

Your job is to rewrite ALL FOUR fields of a brainstorm idea so they're sharper, more specific, and harder for a judge to poke holes in.

Rules:
- Be provocative in your coaching notes, not fluffy. Call out what's weak.
- Keep the core intent — don't invent a different product.
- Idea: one punchy sentence. No buzzword soup.
- Pain: must name WHO, HOW OFTEN, and HOW BADLY. If the original is vague, make reasonable assumptions and flag them with "(assumption)".
- Biggest Risk: name the real killer, not a generic "competition." Prefer testable risks.
- Segment: narrow it. "Everyone" is not a segment. Be specific on company size, role, or industry.
- changes: 3–5 short bullet strings explaining what you fixed and why — tone should be direct ("Your segment was meaningless — narrowed to X").

Return ONLY valid JSON:
{
  "idea": "<string>",
  "pain": "<string>",
  "risk": "<string>",
  "segment": "<string>",
  "changes": ["<string>", ...]
}`;

export class AIRefinerError extends Error {
  constructor(
    message: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = "AIRefinerError";
  }
}

export async function refineIdeaWithAI(
  idea: IdeaInput
): Promise<RefineSuggestion> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIRefinerError(
      "OPENAI_API_KEY is not configured. Add it to .env.local and restart the server.",
      503
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const userPrompt = JSON.stringify(
    {
      idea: idea.idea,
      pain: idea.pain,
      biggestRisk: idea.risk,
      segment: idea.segment,
    },
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
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Rewrite and sharpen this hackathon idea:\n\n${userPrompt}`,
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
    throw new AIRefinerError(
      `OpenAI API error (${response.status}): ${detail}`,
      response.status === 401 ? 401 : 502
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new AIRefinerError("OpenAI returned an empty response.", 502);
  }

  let parsed: RefineSuggestion;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new AIRefinerError("Failed to parse AI response as JSON.", 502);
  }

  if (!parsed.idea || !Array.isArray(parsed.changes)) {
    throw new AIRefinerError("AI response missing required fields.", 502);
  }

  return {
    idea: String(parsed.idea).trim(),
    pain: String(parsed.pain ?? "").trim(),
    risk: String(parsed.risk ?? "").trim(),
    segment: String(parsed.segment ?? "").trim(),
    changes: parsed.changes.map(String),
  };
}
