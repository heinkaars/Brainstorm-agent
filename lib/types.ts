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

export type IdeaField = "idea" | "pain" | "risk" | "segment";

export interface RefineSuggestion {
  idea: string;
  pain: string;
  risk: string;
  segment: string;
  changes: string[];
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

export const FIELD_LABELS: Record<IdeaField, string> = {
  idea: "Idea",
  pain: "Pain",
  risk: "Biggest Risk",
  segment: "Segment",
};
