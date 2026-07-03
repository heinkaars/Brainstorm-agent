"use client";

import type { IdeaInput } from "@/lib/types";

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

export default function IdeaForm({
  ideas,
  onChange,
  onSubmit,
  isEvaluating,
}: IdeaFormProps) {
  const addIdea = () => {
    onChange([
      ...ideas,
      { id: crypto.randomUUID(), idea: "", pain: "", risk: "", segment: "" },
    ]);
  };

  const removeIdea = (id: string) => {
    if (ideas.length <= 1) return;
    onChange(ideas.filter((i) => i.id !== id));
  };

  const hasValidIdea = ideas.some((i) => i.idea.trim().length > 0);

  return (
    <div className="space-y-6">
      {ideas.map((idea, index) => (
        <div key={idea.id} className="card relative">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-sm font-bold text-accent-purple">
                {index + 1}
              </span>
              <h3 className="text-sm font-semibold text-zinc-200">
                Idea {index + 1}
              </h3>
            </div>
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
                onChange={(e) =>
                  onChange(updateIdea(ideas, idea.id, "idea", e.target.value))
                }
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
                onChange={(e) =>
                  onChange(updateIdea(ideas, idea.id, "pain", e.target.value))
                }
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
                onChange={(e) =>
                  onChange(updateIdea(ideas, idea.id, "risk", e.target.value))
                }
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
                onChange={(e) =>
                  onChange(
                    updateIdea(ideas, idea.id, "segment", e.target.value)
                  )
                }
                rows={2}
              />
            </div>
          </div>
        </div>
      ))}

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
  );
}
