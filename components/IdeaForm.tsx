"use client";

import { useState } from "react";
import RefineSuggestions from "@/components/RefineSuggestions";
import type { IdeaField, IdeaInput, RefineSuggestion } from "@/lib/types";

interface IdeaFormProps {
  ideas: IdeaInput[];
  onChange: (ideas: IdeaInput[]) => void;
  onSubmit: () => void;
  isEvaluating: boolean;
}

function updateIdea(
  ideas: IdeaInput[],
  id: string,
  field: keyof Omit<IdeaInput, "id">,
  value: string
): IdeaInput[] {
  return ideas.map((idea) =>
    idea.id === id ? { ...idea, [field]: value } : idea
  );
}

function isIdeaReadyToRefine(idea: IdeaInput): boolean {
  return (
    idea.idea.trim().length > 0 &&
    idea.pain.trim().length > 0 &&
    idea.risk.trim().length > 0 &&
    idea.segment.trim().length > 0
  );
}

export default function IdeaForm({
  ideas,
  onChange,
  onSubmit,
  isEvaluating,
}: IdeaFormProps) {
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [refinedIds, setRefinedIds] = useState<Set<string>>(new Set());
  const [pendingRefine, setPendingRefine] = useState<{
    original: IdeaInput;
    suggestion: RefineSuggestion;
  } | null>(null);

  const addIdea = () => {
    onChange([
      ...ideas,
      { id: crypto.randomUUID(), idea: "", pain: "", risk: "", segment: "" },
    ]);
  };

  const removeIdea = (id: string) => {
    if (ideas.length <= 1) return;
    onChange(ideas.filter((i) => i.id !== id));
    setRefinedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRefine = async (idea: IdeaInput) => {
    setRefiningId(idea.id);
    setRefineError(null);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Refinement failed.");
      }

      setPendingRefine({ original: idea, suggestion: data.suggestion });
    } catch (err) {
      setRefineError(
        err instanceof Error ? err.message : "Refinement failed."
      );
    } finally {
      setRefiningId(null);
    }
  };

  const applySuggestion = (
    ideaId: string,
    fields: Partial<Pick<IdeaInput, IdeaField>>
  ) => {
    onChange(
      ideas.map((i) => (i.id === ideaId ? { ...i, ...fields } : i))
    );
    setRefinedIds((prev) => new Set(prev).add(ideaId));
  };

  const handleAcceptAll = () => {
    if (!pendingRefine) return;
    const { original, suggestion } = pendingRefine;
    applySuggestion(original.id, {
      idea: suggestion.idea,
      pain: suggestion.pain,
      risk: suggestion.risk,
      segment: suggestion.segment,
    });
    setPendingRefine(null);
  };

  const handleAcceptField = (field: IdeaField) => {
    if (!pendingRefine) return;
    const { original, suggestion } = pendingRefine;

    applySuggestion(original.id, { [field]: suggestion[field] });

    const merged = { ...original, [field]: suggestion[field] };
    const allMatch = (["idea", "pain", "risk", "segment"] as IdeaField[]).every(
      (f) => merged[f].trim() === suggestion[f].trim()
    );

    if (allMatch) {
      setPendingRefine(null);
    } else {
      setPendingRefine({ original: merged, suggestion });
    }
  };

  const hasValidIdea = ideas.some((i) => i.idea.trim().length > 0);

  return (
    <>
      <div className="space-y-6">
        {refineError && (
          <div className="rounded-lg border border-accent-red/30 bg-accent-red/10 px-4 py-3 text-sm text-red-300">
            {refineError}
          </div>
        )}

        {ideas.map((idea, index) => {
          const isRefining = refiningId === idea.id;
          const canRefine = isIdeaReadyToRefine(idea) && !isEvaluating;
          const wasRefined = refinedIds.has(idea.id);

          return (
            <div key={idea.id} className="card relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-sm font-bold text-accent-purple">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Idea {index + 1}
                  </h3>
                  {wasRefined && (
                    <span className="rounded-full bg-accent-cyan/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-cyan ring-1 ring-accent-cyan/25">
                      AI Refined
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleRefine(idea)}
                    disabled={!canRefine || isRefining}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent-cyan/30 bg-accent-cyan/5 px-3 py-1.5 text-xs font-medium text-accent-cyan transition-all hover:bg-accent-cyan/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isRefining ? (
                      <>
                        <svg
                          className="h-3.5 w-3.5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Refining...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Refine with AI
                      </>
                    )}
                  </button>
                  {ideas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIdea(idea.id)}
                      className="text-xs text-zinc-500 transition-colors hover:text-accent-red"
                      aria-label={`Remove idea ${index + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Idea <span className="text-accent-red">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="One sentence describing your idea..."
                    value={idea.idea}
                    onChange={(e) => {
                      setRefinedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(idea.id);
                        return next;
                      });
                      onChange(
                        updateIdea(ideas, idea.id, "idea", e.target.value)
                      );
                    }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Pain
                  </label>
                  <textarea
                    className="input-field min-h-[80px] resize-y"
                    placeholder="Who feels this pain? How often? How badly?"
                    value={idea.pain}
                    onChange={(e) => {
                      setRefinedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(idea.id);
                        return next;
                      });
                      onChange(
                        updateIdea(ideas, idea.id, "pain", e.target.value)
                      );
                    }}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Biggest Risk
                  </label>
                  <textarea
                    className="input-field min-h-[80px] resize-y"
                    placeholder="What could kill this idea?"
                    value={idea.risk}
                    onChange={(e) => {
                      setRefinedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(idea.id);
                        return next;
                      });
                      onChange(
                        updateIdea(ideas, idea.id, "risk", e.target.value)
                      );
                    }}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Segment
                  </label>
                  <textarea
                    className="input-field min-h-[80px] resize-y"
                    placeholder="Target customer or market segment..."
                    value={idea.segment}
                    onChange={(e) => {
                      setRefinedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(idea.id);
                        return next;
                      });
                      onChange(
                        updateIdea(ideas, idea.id, "segment", e.target.value)
                      );
                    }}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={addIdea} className="btn-secondary">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Another Idea
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!hasValidIdea || isEvaluating}
            className="btn-primary w-full sm:w-auto"
          >
            {isEvaluating ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Evaluating...
              </>
            ) : (
              <>
                Submit to Evaluator
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {pendingRefine && (
        <RefineSuggestions
          original={pendingRefine.original}
          suggestion={pendingRefine.suggestion}
          onAcceptAll={handleAcceptAll}
          onAcceptField={handleAcceptField}
          onDismiss={() => setPendingRefine(null)}
        />
      )}
    </>
  );
}
