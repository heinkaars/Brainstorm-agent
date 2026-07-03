import { NextResponse } from "next/server";
import { evaluateIdeasWithAI, AIEvaluatorError } from "@/lib/ai-evaluator";
import { evaluateIdeas } from "@/lib/evaluator";
import type { IdeaInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ideas: IdeaInput[] = body.ideas ?? [];

    const filled = ideas.filter(
      (i) => i.idea?.trim() || i.pain?.trim() || i.risk?.trim() || i.segment?.trim()
    );

    if (filled.length === 0) {
      return NextResponse.json(
        { error: "No ideas to evaluate. Add at least one idea." },
        { status: 400 }
      );
    }

    const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

    if (hasApiKey) {
      const results = await evaluateIdeasWithAI(filled);
      return NextResponse.json({ results, source: "ai" });
    }

    const results = evaluateIdeas(filled);
    return NextResponse.json({
      results,
      source: "local",
      warning:
        "Running in offline mode — add OPENAI_API_KEY to .env.local for real AI evaluation.",
    });
  } catch (err) {
    if (err instanceof AIEvaluatorError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      );
    }

    console.error("Evaluation error:", err);
    return NextResponse.json(
      { error: "Something went wrong during evaluation." },
      { status: 500 }
    );
  }
}
