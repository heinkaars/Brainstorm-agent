"use client";

import type { EvaluatedIdea } from "@/lib/types";

interface EvaluationResultsProps {
  results: EvaluatedIdea[];
  source?: "ai" | "local" | null;
  warning?: string | null;
  onBack: () => void;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-mono text-zinc-400">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-purple/70 to-accent-cyan/70 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: EvaluatedIdea["verdict"] }) {
  const isShip = verdict === "SHIP IT";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
        isShip
          ? "bg-accent-green/15 text-accent-green ring-1 ring-accent-green/30"
          : "bg-zinc-800/80 text-zinc-500 ring-1 ring-zinc-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isShip ? "bg-accent-green animate-pulse" : "bg-zinc-600"
        }`}
      />
      {verdict}
    </span>
  );
}

export default function EvaluationResults({
  results,
  source,
  warning,
  onBack,
}: EvaluationResultsProps) {
  const shipCount = results.filter((r) => r.verdict === "SHIP IT").length;
  const skipCount = results.length - shipCount;

  return (
    <div className="space-y-6">
      {warning && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {warning}
        </div>
      )}

      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                Evaluation Matrix
              </h2>
              {source === "ai" && (
                <span className="rounded-full bg-accent-purple/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-purple ring-1 ring-accent-purple/25">
                  AI Powered
                </span>
              )}
              {source === "local" && (
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ring-1 ring-zinc-700">
                  Offline Mode
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {results.length} idea{results.length !== 1 ? "s" : ""} ranked by
              Hackathon Evaluator
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-green" />
              <span className="text-zinc-400">
                <span className="font-semibold text-accent-green">
                  {shipCount}
                </span>{" "}
                Ship
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-600" />
              <span className="text-zinc-400">
                <span className="font-semibold text-zinc-500">{skipCount}</span>{" "}
                Skip
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result) => {
          const isShip = result.verdict === "SHIP IT";

          return (
            <article
              key={result.id}
              className={`card transition-all duration-300 ${
                isShip
                  ? "border-accent-green/30 ring-1 ring-accent-green/10"
                  : "opacity-80"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-2xl font-bold text-zinc-600">
                      #{result.rank}
                    </span>
                    <VerdictBadge verdict={result.verdict} />
                    <span className="rounded-md bg-surface-overlay px-2 py-0.5 font-mono text-xs text-accent-cyan">
                      Score: {result.score}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-semibold leading-snug ${
                      isShip ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {result.idea}
                  </h3>

                  <p className="text-sm leading-relaxed text-zinc-500">
                    {result.rationale}
                  </p>

                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
                        Pain
                      </p>
                      <p className="text-sm text-zinc-400">
                        {result.pain || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
                        Segment
                      </p>
                      <p className="text-sm text-zinc-400">
                        {result.segment || "—"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
                        Biggest Risk
                      </p>
                      <p className="text-sm text-zinc-400">
                        {result.risk || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3 lg:w-48 lg:shrink-0">
                  <ScoreBar
                    label="Pain Clarity"
                    value={result.scores.painClarity}
                  />
                  <ScoreBar
                    label="Market Fit"
                    value={result.scores.marketFit}
                  />
                  <ScoreBar
                    label="Risk Profile"
                    value={result.scores.riskProfile}
                  />
                  <ScoreBar
                    label="Idea Strength"
                    value={result.scores.ideaStrength}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Input Dashboard
        </button>
      </div>
    </div>
  );
}
