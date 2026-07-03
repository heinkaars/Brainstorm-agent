export interface IdeaInput {
  id: string;
  idea: string;
  pain: string;
  risk: string;
  segment: string;
}

export interface EvaluatedIdea extends IdeaInput {
  score: number;
  rank: number;
  verdict: "SHIP IT" | "SKIP IT";
  rationale: string;
  scores: {
    painClarity: number;
    marketFit: number;
    riskProfile: number;
    ideaStrength: number;
  };
}

export function createEmptyIdea(): IdeaInput {
  return {
    id: crypto.randomUUID(),
    idea: "",
    pain: "",
    risk: "",
    segment: "",
  };
}
