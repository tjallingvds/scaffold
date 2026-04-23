"use client";

import { useRef, useState } from "react";
import { Button, PageFrame } from "../_components/PageFrame";
import { Field, TextArea, TextInput } from "../_components/Field";
import { PIINotice } from "../_components/PIINotice";
import { RecentList, useLibrary } from "../_components/Library";
import { RevisePrompt } from "../_components/RevisePrompt";
import { ExampleChips } from "../_components/ExampleChips";
import { DIFFERENTIATION_EXAMPLES } from "@/lib/templates/builder-examples";
import { Help } from "../../_shared/Help";
import type { DifferentiationRequest, DifferentiationResult, LearnerProfile } from "@/lib/types";

const PROFILES: { id: LearnerProfile; label: string; blurb: string }[] = [
  { id: "reading_level_low", label: "Lower reading level", blurb: "Shorter sentences, simpler vocabulary." },
  { id: "reading_level_high", label: "Higher reading level", blurb: "Richer vocabulary, more complex syntax." },
  { id: "adhd", label: "ADHD", blurb: "Visual chunking, short paragraphs." },
  { id: "autism", label: "Autistic learner", blurb: "Explicit instructions, reduced ambiguity." },
  { id: "dyslexia", label: "Dyslexia", blurb: "Short sentences, read-aloud friendly." },
  { id: "ell_intermediate", label: "ELL, intermediate", blurb: "Glossed academic terms, active voice." },
  { id: "executive_function", label: "Executive function", blurb: "External scaffolds, checklists." },
  { id: "sensory_sensitivity", label: "Sensory sensitivity", blurb: "Reduced clutter, smaller chunks." },
  { id: "cultural_context", label: "Cultural context", blurb: "Examples from a specific setting." },
];

export default function DifferentiatePage() {
  const [source, setSource] = useState(
    "Photosynthesis is the process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water. It generally involves the green pigment chlorophyll and generates oxygen as a by-product."
  );
  const [selected, setSelected] = useState<LearnerProfile[]>(["adhd", "ell_intermediate"]);
  const [culturalCtx, setCulturalCtx] = useState("");
  const [result, setResult] = useState<DifferentiationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const library = useLibrary("differentiation");

  function toggle(id: LearnerProfile) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length >= 6 ? s : [...s, id]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      setError("Pick at least one learner profile.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const body: DifferentiationRequest = {
      source_text: source.trim(),
      profiles: selected,
      cultural_context: culturalCtx.trim() || undefined,
    };
    try {
      const res = await fetch("/api/differentiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      const next = data.result as DifferentiationResult;
      setResult(next);
      const title =
        source.trim().slice(0, 60).replace(/\s+/g, " ") || "Differentiation";
      library.save(title, { request: body, result: next });
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageFrame title="Differentiate a reading">
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8">
          {library.entries.length > 0 && !result && (
            <RecentList
              entries={library.entries}
              onPick={(entry) => {
                const d = entry.data as {
                  request: DifferentiationRequest;
                  result: DifferentiationResult;
                };
                setSource(d.request.source_text);
                setSelected(d.request.profiles);
                setCulturalCtx(d.request.cultural_context ?? "");
                setResult(d.result);
                setTimeout(
                  () =>
                    resultRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    }),
                  80,
                );
              }}
              onRemove={library.remove}
            />
          )}
          <form onSubmit={submit} className="flex flex-col gap-6">
            <ExampleChips
              examples={DIFFERENTIATION_EXAMPLES}
              onPick={(ex) => {
                setSource(ex.source_text);
                setSelected(ex.profiles);
                setCulturalCtx(ex.cultural_context ?? "");
                setResult(null);
              }}
            />
            <Field
              label="Source material"
              hint="Paste the text you want differentiated."
            >
              <TextArea
                required
                rows={8}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </Field>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-foreground inline-flex items-center">
                  Learner profiles
                  <Help label="About learner profiles">
                    <p>
                      Each profile is a Universal Design for Learning (UDL) affordance. Scaffold produces a parallel version of your source text adapted to that profile: shorter sentences, added structural cues, in-context glosses for ELL, and so on.
                    </p>
                    <p className="mt-2">
                      <strong>Crucial:</strong> the academic content stays the same. Only surface features change. A student who masters the adapted version has mastered the same concept.
                    </p>
                  </Help>
                </span>
                <span className="text-xs text-muted">
                  {selected.length} of 6 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROFILES.map((p) => {
                  const active = selected.includes(p.id);
                  const disabled = !active && selected.length >= 6;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => !disabled && toggle(p.id)}
                      disabled={disabled}
                      title={p.blurb}
                      className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                        active
                          ? "bg-foreground text-surface border-foreground"
                          : "bg-surface text-foreground border-border hover:border-foreground"
                      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {selected.includes("cultural_context") && (
              <Field
                label="Cultural context"
                hint="Where should examples be set?"
              >
                <TextInput
                  value={culturalCtx}
                  onChange={(e) => setCulturalCtx(e.target.value)}
                  placeholder="e.g. rural West Africa"
                />
              </Field>
            )}

            <PIINotice text={source} />

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generating…" : result ? "Regenerate" : "Generate variants"}
              </Button>
              {isLoading && (
                <span className="text-xs text-muted">Usually 10–20 seconds.</span>
              )}
              {error && <span className="text-xs text-error">{error}</span>}
            </div>
          </form>

          <div ref={resultRef} />

          {result && (
            <div className="border-t border-border pt-8 flex flex-col gap-5">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs text-muted hover:text-foreground rounded-full border border-border bg-surface px-3 py-1.5 hover:border-foreground transition-colors"
                >
                  + Start fresh
                </button>
              </div>
              <RevisePrompt
                kind="differentiation"
                current={result as unknown as Record<string, unknown>}
                onRevised={(next) =>
                  setResult(next as unknown as DifferentiationResult)
                }
                quickActions={[
                  "Make every variant shorter",
                  "Add more visual chunking to the ADHD version",
                  "Use simpler vocabulary across all variants",
                ]}
              />
              <p className="text-xs italic text-muted">{result.source_preserved_check}</p>
              <div className="grid gap-4 md:grid-cols-2">
                {result.variants.map((v, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-surface overflow-hidden">
                    <header className="border-b border-border bg-subtle px-4 py-2.5">
                      <div className="text-sm font-semibold text-foreground">
                        {v.profile_label}
                      </div>
                    </header>
                    <div className="px-4 py-4 flex flex-col gap-3">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {v.transformed_text}
                      </p>
                      <div className="border-t border-border pt-3 text-xs">
                        <div className="text-muted">{v.rationale}</div>
                        {v.changes.length > 0 && (
                          <ul className="list-disc pl-5 mt-2 text-foreground/80 flex flex-col gap-0.5">
                            {v.changes.map((c, j) => (
                              <li key={j}>{c}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
