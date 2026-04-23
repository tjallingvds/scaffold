"use client";

import type { LessonPlan, PhaseBlock } from "@/lib/types";

const PHASE_META = {
  pre_engagement: {
    label: "Phase 1 - Pre-Engagement",
    sublabel: "No AI",
    dotClass: "bg-accent-ink",
  },
  guided_engagement: {
    label: "Phase 2 - Guided Engagement",
    sublabel: "Bounded AI",
    dotClass: "bg-accent",
  },
  reflective_engagement: {
    label: "Phase 3 - Reflective Engagement",
    sublabel: "Open AI",
    dotClass: "bg-indigo-600",
  },
} as const;

const AI_ROLE_LABEL = {
  none: "AI off",
  bounded: "AI bounded",
  open: "AI open",
} as const;

export function LessonView({ plan, isLoading }: { plan: LessonPlan | null; isLoading: boolean }) {
  if (isLoading && !plan) {
    return (
      <div className="flex h-full items-center justify-center text-muted text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-border border-t-accent rounded-full animate-spin" />
          <span>Designing the lesson…</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex h-full items-center justify-center text-muted text-sm px-8 text-center">
        <div>
          <p className="text-foreground font-medium mb-2">Ready when you are.</p>
          <p>
            Fill in the inputs on the left and generate a lesson plan aligned to the
            Scaffolded Mind three-phase cycle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-8 px-8 py-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-xs uppercase tracking-wider text-muted font-medium">
          Learning objective
        </h2>
        <p className="text-lg text-foreground leading-snug">{plan.learning_objective}</p>
      </header>

      <section className="flex flex-col gap-6">
        {plan.phase_breakdown.map((block, i) => (
          <PhaseCard key={i} block={block} />
        ))}
      </section>

      {plan.differentiation_notes.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-border pt-6">
          <h3 className="text-xs uppercase tracking-wider text-muted font-medium">
            Differentiation
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {plan.differentiation_notes.map((note, i) => (
              <div
                key={i}
                className="rounded border border-border bg-surface p-3 text-sm"
              >
                <div className="font-medium text-foreground">{note.profile}</div>
                <div className="text-muted mt-1">{note.adaptation}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.assessment_notes && (
        <section className="flex flex-col gap-2 border-t border-border pt-6">
          <h3 className="text-xs uppercase tracking-wider text-muted font-medium">
            Assessment
          </h3>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {plan.assessment_notes}
          </p>
        </section>
      )}
    </article>
  );
}

function PhaseCard({ block }: { block: PhaseBlock }) {
  const meta = PHASE_META[block.phase];
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-subtle px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} aria-hidden />
          <div>
            <div className="text-sm font-medium text-foreground">
              {meta.label}
              <span className="ml-2 text-muted font-normal">{block.title}</span>
            </div>
            <div className="text-xs text-muted">
              {meta.sublabel} · {AI_ROLE_LABEL[block.ai_role]}
            </div>
          </div>
        </div>
        <span className="text-sm text-muted whitespace-nowrap">
          {block.time_minutes} min
        </span>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        <ol className="flex flex-col gap-3">
          {block.activities.map((act, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-xs text-muted font-mono mt-0.5 min-w-[3rem]">
                {act.minutes} min
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{act.name}</div>
                <div className="text-sm text-foreground/80 mt-0.5 leading-relaxed">
                  {act.description}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {block.materials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
            <span className="text-xs text-muted mr-1">Materials:</span>
            {block.materials.map((m, i) => (
              <span
                key={i}
                className="text-xs bg-subtle text-foreground/80 rounded px-2 py-0.5"
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
