"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, PageFrame } from "../_components/PageFrame";
import { Field, TextArea, TextInput, Select } from "../_components/Field";
import { PIINotice } from "../_components/PIINotice";
import { WarningsPanel } from "../_components/WarningsPanel";
import { StepsRail, type StepItem } from "../_components/StepsRail";
import { RecentList, useLibrary } from "../_components/Library";
import { RevisePrompt } from "../_components/RevisePrompt";
import { ASSIGNMENT_TEMPLATES } from "@/lib/templates/assignments";
import { ASSIGNMENT_EXAMPLES } from "@/lib/templates/assignment-examples";
import type { AssignmentPlan, AssignmentRequest, AssignmentTemplate } from "@/lib/types";

export default function AssignmentPage() {
  return (
    <Suspense>
      <AssignmentPageInner />
    </Suspense>
  );
}

const DEFAULT_EXAMPLE_ID = "gatsby";

function AssignmentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialExample =
    ASSIGNMENT_EXAMPLES.find((e) => e.id === searchParams.get("example")) ??
    ASSIGNMENT_EXAMPLES.find((e) => e.id === DEFAULT_EXAMPLE_ID) ??
    ASSIGNMENT_EXAMPLES[0];
  const shouldAutoGen = searchParams.get("auto") === "1";

  const [plan, setPlan] = useState<AssignmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [template, setTemplate] = useState<AssignmentTemplate>(initialExample.template);
  const [subject, setSubject] = useState(initialExample.subject);
  const [gradeLevel, setGradeLevel] = useState(initialExample.grade_level);
  const [topic, setTopic] = useState(initialExample.topic);
  const [time, setTime] = useState(initialExample.time_minutes);
  const [considerations, setConsiderations] = useState(
    initialExample.special_considerations ?? ""
  );

  function applyExample(id: string) {
    const ex = ASSIGNMENT_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setTemplate(ex.template);
    setSubject(ex.subject);
    setGradeLevel(ex.grade_level);
    setTopic(ex.topic);
    setTime(ex.time_minutes);
    setConsiderations(ex.special_considerations ?? "");
    setPlan(null);
    setError(null);
  }

  const activeExampleId =
    ASSIGNMENT_EXAMPLES.find(
      (ex) =>
        ex.template === template &&
        ex.subject === subject &&
        ex.grade_level === gradeLevel &&
        ex.topic === topic &&
        ex.time_minutes === time &&
        (ex.special_considerations ?? "") === considerations
    )?.id ?? null;

  const stateRef = useRef({ template, subject, gradeLevel, topic, time, considerations });
  useEffect(() => {
    stateRef.current = { template, subject, gradeLevel, topic, time, considerations };
  }, [template, subject, gradeLevel, topic, time, considerations]);

  const resultRef = useRef<HTMLDivElement>(null);
  const library = useLibrary("assignment");
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  async function generate() {
    setIsLoading(true);
    setError(null);
    const s = stateRef.current;
    const body: AssignmentRequest = {
      template: s.template,
      topic: s.topic.trim(),
      subject: s.subject.trim(),
      grade_level: s.gradeLevel.trim(),
      time_minutes: s.time,
      special_considerations: s.considerations.trim() || undefined,
    };
    try {
      const res = await fetch("/api/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      const next = data.plan as AssignmentPlan;
      setPlan(next);
      const title = next.title || s.topic || "Untitled assignment";
      const entryId = library.save(title, { request: body, plan: next });
      setCurrentEntryId(entryId);
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

  useEffect(() => {
    if (searchParams.get("example") || searchParams.get("auto")) {
      router.replace("/assignment");
    }
    if (shouldAutoGen) {
      const t = setTimeout(() => generate(), 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const templateMeta = ASSIGNMENT_TEMPLATES.find((t) => t.id === template)!;

  const steps: StepItem[] = [
    {
      label: "Inputs",
      sub: templateMeta.name,
      state: plan ? "done" : isLoading ? "done" : "active",
    },
    {
      label: isLoading ? "Generating…" : plan ? "Generated" : "Generate",
      sub: plan ? plan.title : "~15 seconds",
      state: plan ? "done" : isLoading ? "active" : "idle",
    },
    {
      label: "Share with students",
      sub: plan ? "Create a student link" : "After generation",
      state: plan ? "active" : "idle",
    },
  ];

  return (
    <PageFrame title="New assignment">
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 grid lg:grid-cols-[1fr_240px] gap-10"><div className="flex flex-col gap-8 min-w-0">
          {library.entries.length > 0 && !plan && (
            <RecentList
              entries={library.entries}
              onPick={(entry) => {
                const d = entry.data as {
                  request: AssignmentRequest;
                  plan: AssignmentPlan;
                };
                setTemplate(d.request.template);
                setSubject(d.request.subject);
                setGradeLevel(d.request.grade_level);
                setTopic(d.request.topic);
                setTime(d.request.time_minutes);
                setConsiderations(d.request.special_considerations ?? "");
                setPlan(d.plan);
                setCurrentEntryId(entry.id);
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
          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              generate();
            }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Start from an example
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ASSIGNMENT_EXAMPLES.map((ex) => {
                  const active = activeExampleId === ex.id;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => applyExample(ex.id)}
                      className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                        active
                          ? "bg-foreground text-surface border-foreground"
                          : "bg-surface text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {ex.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Topic or prompt">
              <TextArea
                required
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Subject">
                <TextInput
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Field>
              <Field label="Grade level">
                <TextInput
                  required
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Template">
                <Select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as AssignmentTemplate)}
                >
                  {ASSIGNMENT_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Time (minutes)">
                <TextInput
                  type="number"
                  required
                  min={10}
                  max={300}
                  value={time}
                  onChange={(e) => setTime(Number(e.target.value))}
                />
              </Field>
            </div>

            <p className="text-xs text-muted leading-relaxed border-l-2 border-border pl-3">
              <strong className="text-foreground">{templateMeta.name}.</strong>{" "}
              {templateMeta.short_description}
            </p>

            <details className="text-sm">
              <summary className="text-sm text-muted cursor-pointer hover:text-foreground">
                Optional: special considerations
              </summary>
              <div className="mt-2">
                <TextArea
                  rows={3}
                  placeholder="e.g. Two students with ADHD, one ELL at intermediate level. No student names."
                  value={considerations}
                  onChange={(e) => setConsiderations(e.target.value)}
                />
                <div className="mt-2">
                  <PIINotice text={`${subject} ${topic} ${considerations}`} />
                </div>
              </div>
            </details>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generating…" : plan ? "Regenerate" : "Generate assignment"}
              </Button>
              {isLoading && (
                <span className="text-xs text-muted">Usually 10–20 seconds.</span>
              )}
              {error && <span className="text-xs text-error">{error}</span>}
            </div>
          </form>

          <div ref={resultRef} />

          {isLoading && !plan && (
            <div className="border-t border-border pt-8">
              <StagedLoading />
            </div>
          )}

          {plan && (
            <div className="border-t border-border pt-8 flex flex-col gap-8">
              <AssignmentResult
                plan={plan}
                onShareCreated={(shareId) => {
                  if (currentEntryId)
                    library.updateShareId(currentEntryId, shareId);
                }}
                onRevised={(next) => setPlan(next)}
              />
            </div>
          )}
          </div>
          <StepsRail title="Progress" steps={steps} />
        </div>
      </div>
    </PageFrame>
  );
}

function StagedLoading() {
  const stages = [
    "Writing the three phases students will walk through…",
    "Drafting what you'll see on each submission…",
    "Writing the AI tutor's instructions…",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % stages.length), 2200);
    return () => clearInterval(t);
  }, [stages.length]);
  return (
    <div className="flex items-center gap-3 text-muted text-sm">
      <div className="h-5 w-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
      <span className="text-foreground">{stages[i]}</span>
    </div>
  );
}

function AssignmentResult({
  plan,
  onShareCreated,
  onRevised,
}: {
  plan: AssignmentPlan;
  onShareCreated?: (shareId: string) => void;
  onRevised: (next: AssignmentPlan) => void;
}) {
  const hasWarnings = (plan.framework_warnings?.length ?? 0) > 0;
  return (
    <>
      <ShareCard plan={plan} onShareCreated={onShareCreated} />

      <RevisePrompt
        kind="assignment"
        current={plan as unknown as Record<string, unknown>}
        onRevised={(next) => onRevised(next as unknown as AssignmentPlan)}
        quickActions={[
          "Make Phase 2 shorter",
          "Add an ADHD-friendly adaptation",
          "Rewrite the tutor prompt to be more firm",
          "Add a second textual anchor to Phase 1",
        ]}
      />

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {plan.title}
        </h2>
        <p className="text-sm text-muted mt-1">
          Grade {plan.grade_level} · {plan.time_minutes} min
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          What students do
        </h3>
        <ol className="flex flex-col gap-3">
          {plan.student_steps.map((s) => (
            <li key={s.number} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-baseline justify-between mb-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Step {s.number}: {s.title}
                </h4>
                <span className="text-xs text-muted">{s.time_minutes} min</span>
              </div>
              <div className="text-xs text-muted mb-2">
                {s.phase.replace("_", " ")} · AI {s.ai_role}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {s.instructions}
              </p>
              <div className="mt-2 text-xs">
                <span className="text-muted">They turn in: </span>
                <span className="text-foreground">{s.deliverable}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          What you&rsquo;re grading
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-subtle text-xs text-muted uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Dimension</th>
                <th className="text-left px-3 py-2 font-medium">Focus</th>
                <th className="text-left px-3 py-2 font-medium">Strong</th>
                <th className="text-left px-3 py-2 font-medium">Weak</th>
                <th className="text-right px-3 py-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {plan.shapr_rubric.map((r, i) => (
                <tr key={i} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-medium">{r.dimension}</td>
                  <td className="px-3 py-2 text-foreground/90">{r.focus}</td>
                  <td className="px-3 py-2 text-foreground/90">{r.high_proficiency}</td>
                  <td className="px-3 py-2 text-foreground/90">{r.low_proficiency}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.weight_percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {plan.teacher_notes && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-2">Teacher notes</h3>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {plan.teacher_notes}
          </p>
        </section>
      )}

      {hasWarnings && <WarningsPanel warnings={plan.framework_warnings} />}
    </>
  );
}

function ShareCard({
  plan,
  onShareCreated,
}: {
  plan: AssignmentPlan;
  onShareCreated?: (shareId: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function create() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || `HTTP ${res.status}`);
        return;
      }
      setShareId(data.id);
      setUrl(`${window.location.origin}/student/${data.id}`);
      onShareCreated?.(data.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Share failed");
    } finally {
      setBusy(false);
    }
  }

  if (!url) {
    return (
      <section className="rounded-2xl border border-foreground/10 bg-subtle p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
            Ready for your class
          </div>
          <h3 className="text-base font-semibold text-foreground mt-0.5">
            Create a student link
          </h3>
          <p className="text-xs text-muted mt-1">
            One URL. Paste in your LMS. Students open it - no setup on their end.
          </p>
        </div>
        <button
          type="button"
          onClick={create}
          disabled={busy}
          className="rounded-full bg-foreground text-surface px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity whitespace-nowrap self-start md:self-auto"
        >
          {busy ? "Preparing…" : "Create link →"}
        </button>
        {err && <span className="text-xs text-error">{err}</span>}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-foreground/15 bg-subtle p-5">
      <div className="flex items-center gap-2 mb-2">
        <span
          aria-hidden
          className="w-5 h-5 rounded-full bg-foreground text-surface flex items-center justify-center text-xs font-semibold"
        >
          ✓
        </span>
        <div className="text-[10px] uppercase tracking-[0.14em] text-foreground font-semibold">
          Link ready
        </div>
      </div>
      <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex-1 text-sm text-foreground font-mono truncate hover:underline"
        >
          {url}
        </a>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-full bg-foreground text-surface px-3 py-1.5 text-xs font-medium hover:opacity-90 whitespace-nowrap"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-3 text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-foreground font-medium hover:underline"
        >
          Preview as a student ↗
        </a>
        {shareId && (
          <a
            href={`/submissions/${shareId}`}
            target="_blank"
            rel="noreferrer"
            className="text-foreground font-medium hover:underline"
          >
            View submissions ↗
          </a>
        )}
        <span className="text-muted">
          See what your class will see, or the work they&rsquo;ve sent back.
        </span>
      </div>
    </section>
  );
}
