"use client";

interface Example {
  id: string;
  label: string;
}

export function ExampleChips<T extends Example>({
  examples,
  onPick,
  activeId,
  label = "Start from an example",
}: {
  examples: T[];
  onPick: (example: T) => void;
  activeId?: string | null;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {examples.map((ex) => {
          const active = activeId === ex.id;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onPick(ex)}
              className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                active
                  ? "bg-foreground text-surface border-foreground"
                  : "bg-surface text-foreground border-border hover:border-foreground hover:bg-subtle"
              }`}
            >
              {ex.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
