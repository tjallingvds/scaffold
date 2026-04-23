"use client";

import { useState } from "react";

export type ReviseKind =
  | "assignment"
  | "lesson"
  | "policy"
  | "semester"
  | "differentiation";

export function RevisePrompt<T extends Record<string, unknown>>({
  kind,
  current,
  onRevised,
  placeholder,
  quickActions,
}: {
  kind: ReviseKind;
  current: T;
  onRevised: (next: T) => void;
  placeholder?: string;
  quickActions?: string[];
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(instruction: string) {
    if (!instruction.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, current, instruction }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
        return;
      }
      onRevised(data.plan as T);
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revise failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border-2 border-dashed border-foreground/15 bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-surface text-xs font-semibold"
        >
          ↻
        </span>
        <div>
          <div className="text-sm font-semibold text-foreground leading-tight">
            Ask the AI to edit this
          </div>
          <p className="text-xs text-muted leading-tight mt-0.5">
            Targeted change. The rest stays the same.
          </p>
        </div>
      </div>

      {quickActions && quickActions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => run(a)}
              disabled={busy}
              className="text-xs rounded-full border border-border bg-subtle text-foreground px-3 py-1.5 hover:border-foreground hover:bg-surface transition-colors disabled:opacity-50"
            >
              {a}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(text);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              run(text);
            }
          }}
          placeholder={
            placeholder ??
            "e.g. make Phase 2 shorter / add an ADHD adaptation / use a different example"
          }
          rows={2}
          disabled={busy}
          className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-sm resize-none outline-none focus:border-foreground transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-full bg-foreground text-surface px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
        >
          {busy ? "Revising…" : "Revise"}
        </button>
      </form>

      {error && <div className="text-xs text-error">{error}</div>}
    </section>
  );
}
