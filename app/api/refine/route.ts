import { NextResponse } from "next/server";
import { refineIdeaWithAI, AIRefinerError } from "@/lib/ai-refiner";
import type { IdeaInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea: IdeaInput = body.idea;

    if (!idea?.id) {
      return NextResponse.json({ error: "Invalid idea payload." }, { status: 400 });
    }

    if (!idea.idea?.trim()) {
      return NextResponse.json(
        { error: "Idea field is required before refining." },
        { status: 400 }
      );
    }

    if (!idea.pain?.trim() || !idea.risk?.trim() || !idea.segment?.trim()) {
      return NextResponse.json(
        {
          error:
            "Fill in all four fields (Idea, Pain, Biggest Risk, Segment) before refining.",
        },
        { status: 400 }
      );
    }

    const suggestion = await refineIdeaWithAI(idea);
    return NextResponse.json({ suggestion, source: "ai" });
  } catch (err) {
    if (err instanceof AIRefinerError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      );
    }

    console.error("Refine error:", err);
    return NextResponse.json(
      { error: "Something went wrong during refinement." },
      { status: 500 }
    );
  }
}
