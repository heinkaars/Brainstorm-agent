"use client";

import type { IdeaField, IdeaInput, RefineSuggestion } from "@/lib/types";
import { FIELD_LABELS } from "@/lib/types";

interface RefineSuggestionsProps {
  original: IdeaInput;
  suggestion: RefineSuggestion;
  onAcceptAll: () => void;
  onAcceptField: (field: IdeaField) => void;
  onDismiss: () => void;
}

const FIELDS: IdeaField[] = ["idea", "pain", "risk", "segment"];

function FieldDiff({
  field,
  original,
  suggested,
  onAccept,
}: {
  field: IdeaField;
  original: string;
  suggested: string;
  onAccept: () => void;
}) {
  const unchanged = original.trim() === suggested.trim();

  return (
    <div className="rounded-lg border border-surface-border bg-surface-overlay/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {FIELD_LABELS[field]}
        </span>
        {!unchanged && (
          <button
            type="button"
            onClick={onAccept}
            className="text-xs font-medium text-accent-cyan transition-colors hover:text-accent-cyan/80"
          >
            Accept
          </button>
        )}
      </div>

      {unchanged ? (
        <p className="text-sm text-zinc-500 italic">No changes suggested.</p>
      ) : (
        <div className="space-y-2">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">
              Yours
            </p>
            <p className="text-sm text-zinc-500 line-through decoration-zinc-600">
              {original || "—"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-accent-cyan/70">
              Suggested
            </p>
            <p className="text-sm leading-relaxed text-zinc-100">{suggested}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RefineSuggestions({
  original,
  suggestion,
  onAcceptAll,
  onAcceptField,
  onDismiss,
}: RefineSuggestionsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden
      />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-surface-border bg-surface-raised shadow-card">
        <div className="sticky top-0 border-b border-surface-border bg-surface-raised px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Refinement Suggestions
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Your coach didn&apos;t pull punches. Review before accepting.
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-surface-overlay hover:text-white"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          {suggestion.changes.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                What needed fixing
              </p>
              <ul className="space-y-1.5">
                {suggestion.changes.map((change, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-amber-100/80"
                  >
                    <span className="text-amber-500">→</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            {FIELDS.map((field) => (
              <FieldDiff
                key={field}
                field={field}
                original={original[field]}
                suggested={suggestion[field]}
                onAccept={() => onAcceptField(field)}
              />
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-surface-border bg-surface-raised px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onDismiss} className="btn-secondary">
            Keep Mine
          </button>
          <button type="button" onClick={onAcceptAll} className="btn-primary">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
