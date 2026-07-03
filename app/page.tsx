"use client";

import { useState } from "react";
import IdeaForm from "@/components/IdeaForm";
import EvaluationResults from "@/components/EvaluationResults";
import { createEmptyIdea, type EvaluatedIdea, type IdeaInput } from "@/lib/types";

type Screen = "input" | "results";
type EvalSource = "ai" | "local" | null;

export default function Home() {
  const [screen, setScreen] = useState<Screen>("input");
  const [ideas, setIdeas] = useState<IdeaInput[]>([createEmptyIdea()]);
  const [results, setResults] = useState<EvaluatedIdea[]>([]);
  const [evalSource, setEvalSource] = useState<EvalSource>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsEvaluating(true);
    setError(null);
    setWarning(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideas }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Evaluation failed.");
      }

      setResults(data.results);
      setEvalSource(data.source);
      if (data.warning) setWarning(data.warning);
      setScreen("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleBack = () => {
    setScreen("input");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border/60 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-violet-700 shadow-glow">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Brainstorm Agent
              </h1>
              <p className="text-xs text-zinc-500">
                Hackathon Evaluator MVP
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            <StepIndicator
              label="Input"
              active={screen === "input"}
              completed={screen === "results"}
              step={1}
            />
            <div className="mx-2 h-px w-8 bg-surface-border" />
            <StepIndicator
              label="Results"
              active={screen === "results"}
              completed={false}
              step={2}
            />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {screen === "input" ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Input Dashboard
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
                Log your brainstorming ideas below. Fill all four fields, then
                hit <span className="text-accent-cyan">Refine with AI</span> for
                a provocative coach pass before submitting to the evaluator.
              </p>
            </div>
            {error && (
              <div className="mb-6 rounded-lg border border-accent-red/30 bg-accent-red/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <IdeaForm
              ideas={ideas}
              onChange={setIdeas}
              onSubmit={handleSubmit}
              isEvaluating={isEvaluating}
            />
          </>
        ) : (
          <EvaluationResults
            results={results}
            source={evalSource}
            warning={warning}
            onBack={handleBack}
          />
        )}
      </main>

      <footer className="border-t border-surface-border/40 py-6 text-center text-xs text-zinc-600">
        Brainstorm Agent — Structure ideas. Ship the best ones.
      </footer>
    </div>
  );
}

function StepIndicator({
  label,
  active,
  completed,
  step,
}: {
  label: string;
  active: boolean;
  completed: boolean;
  step: number;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium ${
        active ? "text-white" : completed ? "text-accent-purple" : "text-zinc-600"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
          active
            ? "bg-accent-purple text-white"
            : completed
              ? "bg-accent-purple/20 text-accent-purple"
              : "bg-surface-overlay text-zinc-600"
        }`}
      >
        {completed ? "✓" : step}
      </span>
      {label}
    </div>
  );
}
