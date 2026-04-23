"use client";

import type { FrameworkWarning } from "@/lib/types";

const SEVERITY_META = {
  error: {
    label: "Framework violation",
    tone: "bg-peach-soft border-peach/50 text-peach-ink",
    icon: "✕",
  },
  warning: {
    label: "Warning",
    tone: "bg-butter-soft border-butter/60 text-butter-ink",
    icon: "!",
  },
  info: {
    label: "Note",
    tone: "bg-lilac-soft border-lilac/60 text-lilac-ink",
    icon: "i",
  },
} as const;

export function WarningsPanel({ warnings }: { warnings: FrameworkWarning[] | null }) {
  return (
    <aside className="flex flex-col gap-3">
      <header className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-foreground">Framework check</h2>
        <p className="text-xs text-muted leading-snug">
          Flagged whenever a design drifts from the Scaffolded Mind principles.
        </p>
      </header>

      {!warnings && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4 text-xs text-muted">
          Warnings appear here after you generate.
        </div>
      )}

      {warnings && warnings.length === 0 && (
        <div className="rounded-2xl border border-mint/50 bg-mint-soft px-4 py-3 text-xs text-mint-ink">
          No framework issues detected.
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <ul className="flex flex-col gap-2">
          {warnings.map((w, i) => {
            const meta = SEVERITY_META[w.severity];
            return (
              <li key={i} className={`rounded-2xl border ${meta.tone} p-3 flex gap-2.5`}>
                <span
                  aria-hidden
                  className={`font-mono font-bold text-sm flex-shrink-0 w-5 h-5 rounded-full bg-surface flex items-center justify-center`}
                >
                  {meta.icon}
                </span>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wide">
                    {meta.label}
                  </div>
                  <div className="text-xs text-foreground/90 mt-1 leading-relaxed">
                    {w.message}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
