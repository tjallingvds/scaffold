"use client";

import { useMemo, useRef, useState } from "react";
import { PageFrame, Button } from "../_components/PageFrame";
import { Field, TextArea, TextInput } from "../_components/Field";
import {
  CATEGORY_META,
  PROMPT_LIBRARY,
  type PromptCategory,
  type PromptTemplate,
} from "@/lib/templates/prompt-library";

const RUNNER_SYSTEM = `You are a thoughtful teaching assistant. A teacher is prototyping classroom materials using a parameterized prompt. Respond directly and usefully to the teacher's filled-in prompt. Be concise, specific, and practical.`;

export default function PromptsPage() {
  const [activeId, setActiveId] = useState(PROMPT_LIBRARY[0].id);
  const active = PROMPT_LIBRARY.find((p) => p.id === activeId)!;

  const grouped = useMemo(() => {
    const g: Record<PromptCategory, PromptTemplate[]> = {
      representation: [],
      engagement: [],
      action_expression: [],
      pre_engagement: [],
      reflection: [],
    };
    for (const p of PROMPT_LIBRARY) g[p.category].push(p);
    return g;
  }, []);

  return (
    <PageFrame title="Prompt Library">
      <div className="h-full overflow-hidden flex">
        <aside className="w-72 border-r border-border bg-surface overflow-y-auto">
          <div className="px-4 py-5 flex flex-col gap-5">
            {(Object.keys(grouped) as PromptCategory[]).map((cat) => (
              <div key={cat}>
                <div className="px-2 mb-1.5">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-muted font-semibold">
                    {CATEGORY_META[cat].label}
                  </div>
                </div>
                <ul className="flex flex-col gap-0.5">
                  {grouped[cat].map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => setActiveId(p.id)}
                        className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                          p.id === activeId
                            ? "bg-foreground text-surface"
                            : "text-foreground hover:bg-subtle"
                        }`}
                      >
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
        <section className="flex-1 overflow-y-auto bg-surface">
          <PromptRunner key={active.id} prompt={active} />
        </section>
      </div>
    </PageFrame>
  );
}

function PromptRunner({ prompt }: { prompt: PromptTemplate }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const rendered = prompt.variables.reduce((acc, v) => {
    const placeholder = `[${v.key}]`;
    const val = values[v.key]?.trim();
    return acc.split(placeholder).join(val ? val : placeholder);
  }, prompt.template);

  const allFilled = prompt.variables.every((v) => (values[v.key] ?? "").trim().length > 0);

  async function run() {
    setRunning(true);
    setError(null);
    setOutput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: RUNNER_SYSTEM,
          messages: [{ role: "user", content: rendered }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      setOutput(data.reply as string);
      setTimeout(
        () => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-6">
      <header>
        <h2 className="font-display text-2xl text-foreground leading-tight">
          {prompt.name}
        </h2>
        <p className="text-sm text-muted mt-1">{prompt.description}</p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="flex flex-col gap-5"
      >
        {prompt.variables.map((v) => (
          <Field key={v.key} label={v.label}>
            {v.key === "TEXT" ? (
              <TextArea
                rows={6}
                placeholder={v.placeholder}
                value={values[v.key] ?? ""}
                onChange={(e) => set(v.key, e.target.value)}
              />
            ) : (
              <TextInput
                placeholder={v.placeholder}
                value={values[v.key] ?? ""}
                onChange={(e) => set(v.key, e.target.value)}
              />
            )}
          </Field>
        ))}

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={running || !allFilled}>
            {running ? "Running…" : output ? "Run again" : "Run this prompt"}
          </Button>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(rendered);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="text-xs text-muted hover:text-foreground"
          >
            {copied ? "✓ Copied prompt" : "Copy prompt only"}
          </button>
          {error && <span className="text-xs text-error">{error}</span>}
        </div>
      </form>

      <details>
        <summary className="text-xs text-muted cursor-pointer hover:text-foreground">
          See the rendered prompt text
        </summary>
        <pre className="mt-2 whitespace-pre-wrap bg-subtle border border-border rounded-xl p-4 text-xs font-mono text-foreground">
          {rendered}
        </pre>
      </details>

      <div ref={outputRef} />

      {output !== null && (
        <section className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Output</h3>
            {output && (
              <CopyOutput text={output} />
            )}
          </div>
          {running && !output && (
            <div className="flex items-center gap-3 text-muted text-sm">
              <div className="h-5 w-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
              <span className="text-foreground">Thinking…</span>
            </div>
          )}
          {output && (
            <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {output}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function CopyOutput({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs text-foreground hover:underline"
    >
      {copied ? "✓ Copied" : "Copy output"}
    </button>
  );
}
