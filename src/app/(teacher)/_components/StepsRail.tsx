"use client";

export interface StepItem {
  label: string;
  sub?: string;
  state: "done" | "active" | "idle";
}

export function StepsRail({
  title,
  steps,
  hint,
}: {
  title?: string;
  steps: StepItem[];
  hint?: string;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 flex flex-col gap-3">
        {title && (
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold px-1">
            {title}
          </div>
        )}
        <ol className="flex flex-col gap-2">
          {steps.map((s, i) => (
            <li
              key={i}
              className={`rounded-lg border p-3 transition-all ${
                s.state === "active"
                  ? "border-foreground bg-subtle"
                  : s.state === "done"
                    ? "border-border bg-surface"
                    : "border-border bg-surface/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold border ${
                    s.state === "done"
                      ? "bg-foreground border-foreground text-surface"
                      : s.state === "active"
                        ? "bg-surface border-foreground text-foreground"
                        : "bg-subtle border-border text-muted"
                  }`}
                >
                  {s.state === "done" ? "✓" : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {s.label}
                  </div>
                  {s.sub && (
                    <div className="text-[11px] text-muted truncate">{s.sub}</div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
        {hint && (
          <div className="mt-1 px-1 text-xs text-muted leading-relaxed">{hint}</div>
        )}
      </div>
    </aside>
  );
}
