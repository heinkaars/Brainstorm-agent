import type { EvaluatedIdea, IdeaInput } from "./types";

const PAIN_KEYWORDS = [
  "daily",
  "weekly",
  "every",
  "always",
  "never",
  "hours",
  "minutes",
  "cost",
  "lose",
  "waste",
  "frustrat",
  "struggle",
  "pain",
  "problem",
  "broken",
  "slow",
  "expensive",
  "manual",
];

const SEGMENT_KEYWORDS = [
  "startup",
  "enterprise",
  "smb",
  "developer",
  "designer",
  "manager",
  "team",
  "consumer",
  "b2b",
  "b2c",
  "saas",
  "healthcare",
  "finance",
  "education",
  "freelanc",
];

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function scoreTextLength(text: string, ideal: number, max: number): number {
  const len = text.trim().length;
  if (len === 0) return 0;
  if (len <= ideal) return 40 + (len / ideal) * 40;
  if (len <= max) return 80 + ((max - len) / (max - ideal)) * 20;
  return clamp(80 - (len - max) * 0.3);
}

function keywordBonus(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  const matches = keywords.filter((kw) => lower.includes(kw)).length;
  return clamp(matches * 8, 0, 24);
}

function scorePainClarity(pain: string): number {
  const base = scoreTextLength(pain, 80, 200);
  const bonus = keywordBonus(pain, PAIN_KEYWORDS);
  const hasWho = /\b(users?|teams?|people|customers?|founders?|managers?|developers?)\b/i.test(pain);
  const hasFrequency = /\b(daily|weekly|monthly|every|often|always|constantly|\d+x)\b/i.test(pain);
  const contextBonus = (hasWho ? 8 : 0) + (hasFrequency ? 8 : 0);
  return clamp(base + bonus + contextBonus);
}

function scoreMarketFit(segment: string): number {
  const base = scoreTextLength(segment, 30, 120);
  const bonus = keywordBonus(segment, SEGMENT_KEYWORDS);
  const isSpecific = segment.split(/\s+/).length >= 3;
  return clamp(base + bonus + (isSpecific ? 10 : 0));
}

function scoreRiskProfile(risk: string): number {
  const len = risk.trim().length;
  if (len === 0) return 30;

  const lower = risk.toLowerCase();
  const severeRisks = [
    "regulatory",
    "legal",
    "no market",
    "crowded",
    "commodit",
    "network effect",
    "capital intensive",
    "unproven",
  ];
  const mitigatedRisks = [
    "mitigat",
    "plan",
    "validate",
    "test",
    "pilot",
    "mvp",
    "low cost",
    "manageable",
  ];

  let score = scoreTextLength(risk, 40, 150);

  const severeCount = severeRisks.filter((r) => lower.includes(r)).length;
  const mitigatedCount = mitigatedRisks.filter((r) => lower.includes(r)).length;

  score -= severeCount * 10;
  score += mitigatedCount * 8;

  return clamp(score);
}

function scoreIdeaStrength(idea: string): number {
  const base = scoreTextLength(idea, 60, 140);
  const words = idea.trim().split(/\s+/).length;
  const wordBonus = words >= 5 && words <= 20 ? 10 : 0;
  const actionVerb = /\b(build|create|automate|help|enable|reduce|improve|streamline|connect|deliver)\b/i.test(idea);
  return clamp(base + wordBonus + (actionVerb ? 8 : 0));
}

function buildRationale(
  idea: IdeaInput,
  scores: EvaluatedIdea["scores"],
  verdict: EvaluatedIdea["verdict"]
): string {
  const highlights: string[] = [];

  if (scores.painClarity >= 75) {
    highlights.push("clear, well-defined pain point");
  } else if (scores.painClarity < 50) {
    highlights.push("pain point needs sharper definition (who, frequency, severity)");
  }

  if (scores.marketFit >= 75) {
    highlights.push("target segment is specific and actionable");
  } else if (scores.marketFit < 50) {
    highlights.push("segment is too vague to prioritize");
  }

  if (scores.riskProfile >= 70) {
    highlights.push("risks appear manageable or well-articulated");
  } else if (scores.riskProfile < 45) {
    highlights.push("significant unresolved risks flagged");
  }

  if (scores.ideaStrength >= 75) {
    highlights.push("idea is concise and compelling");
  }

  const prefix =
    verdict === "SHIP IT"
      ? "Strong candidate — "
      : "Needs more work — ";

  return prefix + highlights.slice(0, 3).join("; ") + ".";
}

export function evaluateIdeas(ideas: IdeaInput[]): EvaluatedIdea[] {
  const filled = ideas.filter(
    (i) => i.idea.trim() || i.pain.trim() || i.risk.trim() || i.segment.trim()
  );

  if (filled.length === 0) return [];

  const scored = filled.map((idea) => {
    const scores = {
      painClarity: scorePainClarity(idea.pain),
      marketFit: scoreMarketFit(idea.segment),
      riskProfile: scoreRiskProfile(idea.risk),
      ideaStrength: scoreIdeaStrength(idea.idea),
    };

    const score = Math.round(
      scores.painClarity * 0.3 +
        scores.marketFit * 0.25 +
        scores.riskProfile * 0.2 +
        scores.ideaStrength * 0.25
    );

    return { idea, score, scores };
  });

  scored.sort((a, b) => b.score - a.score);

  const shipThreshold = scored.length === 1 ? 55 : Math.max(55, scored[0].score - 15);

  return scored.map((item, index) => {
    const verdict: EvaluatedIdea["verdict"] =
      item.score >= shipThreshold && index < Math.ceil(scored.length / 2)
        ? "SHIP IT"
        : "SKIP IT";

    return {
      ...item.idea,
      score: item.score,
      rank: index + 1,
      verdict,
      rationale: buildRationale(item.idea, item.scores, verdict),
      scores: item.scores,
    };
  });
}
