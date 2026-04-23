"use client";

import { useRef, useState } from "react";
import { Button, PageFrame } from "../_components/PageFrame";
import { Field, TextArea, TextInput } from "../_components/Field";
import { PIINotice } from "../_components/PIINotice";
import { LessonView } from "../_components/LessonView";
import { WarningsPanel } from "../_components/WarningsPanel";
import { StepsRail, type StepItem } from "../_components/StepsRail";
import type { AssignmentPlan, LessonPlan, LessonRequest } from "@/lib/types";

const SCOPE_OPTIONS: { value: LessonRequest["scope"]; label: string }[] = [
  { value: "full_cycle", label: "Full three-phase cycle" },
  { value: "pre_engagement", label: "Pre-engagement only (AI off)" },
  { value: "guided_engagement", label: "Guided engagement only" },
  { value: "reflective_engagement", label: "Reflective engagement only" },
];

export default function LessonPage() {
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState("10th-grade biology");
  const [gradeLevel, setGradeLevel] = useState("10");
  const [concept, setConcept] = useState("Natural selection");
  const [objective, setObjective] = useState(
    "Students can explain how allele frequencies shift in a population under selection pressure."
  );
  const [time, setTime] = useState(75);
  const [scope, setScope] = useState<LessonRequest["scope"]>("full_cycle");
  const [considerations, setConsiderations] = useState(
    "Two students with ADHD; one ELL at intermediate level."
  );

  const resultRef = useRef<HTMLDivElement>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const body: LessonRequest = {
      subject: subject.trim(),
      grade_level: gradeLevel.trim(),
      concept: concept.trim(),
      learning_objective: objective.trim(),
      time_minutes: time,
      scope,
      special_considerations: considerations.trim() || undefined,
    };
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      setPlan(data.plan as LessonPlan);
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

  const steps: StepItem[] = [
    {
      label: "Inputs",
      sub: concept || "Concept",
      state: plan ? "done" : isLoading ? "done" : "active",
    },
    {
      label: isLoading ? "Generating…" : plan ? "Generated" : "Generate",
      sub: plan ? plan.learning_objective.slice(0, 60) + "…" : "~15 seconds",
      state: plan ? "done" : isLoading ? "active" : "idle",
    },
    {
      label: "Make available to students",
      sub: plan ? "Create a student link" : "After generation",
      state: plan ? "active" : "idle",
    },
  ];

  return (
    <PageFrame title="New lesson">
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 grid lg:grid-cols-[1fr_240px] gap-10">
          <div className="flex flex-col gap-8 min-w-0">
          <form onSubmit={generate} className="flex flex-col gap-6">
            <Field label="Concept">
              <TextInput
                required
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
              />
            </Field>

            <Field label="Learning objective">
              <TextArea
                required
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
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
              <Field label="Class time (minutes)">
                <TextInput
                  type="number"
                  required
                  min={5}
                  max={300}
                  value={time}
                  onChange={(e) => setTime(Number(e.target.value))}
                />
              </Field>
              <Field label="Scope">
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as LessonRequest["scope"])}
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none transition-colors"
                >
                  {SCOPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <details>
              <summary className="text-sm text-muted cursor-pointer hover:text-foreground">
                Optional: special considerations
              </summary>
              <div className="mt-2">
                <TextArea
                  rows={3}
                  value={considerations}
                  onChange={(e) => setConsiderations(e.target.value)}
                  placeholder="Neurodivergent profiles, ELL level, accommodations - no student names."
                />
                <div className="mt-2">
                  <PIINotice text={`${subject} ${considerations} ${concept} ${objective}`} />
                </div>
              </div>
            </details>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generating…" : plan ? "Regenerate" : "Generate lesson"}
              </Button>
              {isLoading && (
                <span className="text-xs text-muted">Usually 10–20 seconds.</span>
              )}
              {error && <span className="text-xs text-error">{error}</span>}
            </div>
          </form>

          <div ref={resultRef} />

          {plan && (
            <div className="border-t border-border pt-6 flex flex-col gap-6">
              <ShareLessonCard
                lesson={plan}
                concept={concept}
                gradeLevel={gradeLevel}
                timeMinutes={time}
              />
              <LessonView plan={plan} isLoading={false} />
              {(plan.framework_warnings?.length ?? 0) > 0 && (
                <WarningsPanel warnings={plan.framework_warnings} />
              )}
            </div>
          )}
          </div>
          <StepsRail title="Progress" steps={steps} />
        </div>
      </div>
    </PageFrame>
  );
}

// ---- Convert a lesson plan into a student-shareable assignment plan ----

function lessonToSharedPlan(
  lesson: LessonPlan,
  concept: string,
  gradeLevel: string,
  timeMinutes: number
): AssignmentPlan {
  // Map each phase of the lesson to a student step in the three-phase cycle.
  const studentSteps = lesson.phase_breakdown.map((phase, i) => {
    const instructions =
      phase.activities.length > 0
        ? phase.activities
            .map((a) => `• ${a.name} (${a.minutes} min) - ${a.description}`)
            .join("\n")
        : phase.title;
    const deliverable =
      phase.phase === "pre_engagement"
        ? "Your own first attempt - no AI, no internet."
        : phase.phase === "guided_engagement"
          ? "The AI interaction log + updated thinking."
          : "A written reflection on what changed.";
    return {
      number: i + 1,
      phase: phase.phase,
      ai_role: phase.ai_role,
      title: phase.title,
      instructions,
      time_minutes: phase.time_minutes,
      deliverable,
    };
  });

  return {
    template: "compare_critique",
    title: `Lesson: ${concept}`,
    topic: lesson.learning_objective,
    grade_level: gradeLevel,
    time_minutes: timeMinutes,
    student_steps: studentSteps,
    required_artifacts: [
      "Initial unassisted attempt",
      "Verbatim AI interaction log",
      "Written reflection on what changed",
    ],
    shapr_rubric: [
      {
        dimension: "Structure",
        focus: "Visible plan before AI is used.",
        high_proficiency: "Clear framing of what the student already knows and is confused about.",
        low_proficiency: "No visible plan; AI used to generate a starting point.",
        weight_percent: 15,
      },
      {
        dimension: "Hypothesis",
        focus: "A real first-attempt commitment.",
        high_proficiency: "Specific, defensible attempt grounded in prior knowledge.",
        low_proficiency: "Vague, non-committal, or AI-derived.",
        weight_percent: 20,
      },
      {
        dimension: "AI-Assistance",
        focus: "Purposeful prompts; thinking not outsourced.",
        high_proficiency: "Prompts seek challenges to the student's own thinking.",
        low_proficiency: "Prompts ask AI to do the thinking.",
        weight_percent: 20,
      },
      {
        dimension: "Peer-Review",
        focus: "Engagement with alternative views or evidence.",
        high_proficiency: "Represents at least one opposing view fairly.",
        low_proficiency: "Only one view taken seriously.",
        weight_percent: 15,
      },
      {
        dimension: "Reflection",
        focus: "Which AI suggestions were accepted or rejected, and why.",
        high_proficiency: "Names what changed, what didn't, and why - with evidence.",
        low_proficiency: "Generic, confirms original reading without evidence.",
        weight_percent: 30,
      },
    ],
    teacher_notes: lesson.assessment_notes || "",
    student_system_prompt: `You are a Socratic tutor helping a student think about "${concept}" at a ${gradeLevel} level.

Two kinds of questions will come at you. Handle them DIFFERENTLY.

1. INFORMATIONAL QUESTIONS - facts, definitions, background, what happens in a source. Answer concisely (under 120 words), then invite the student back to their own thinking with one short question.

2. THINKING QUESTIONS - asking you to take a position, write a draft, give "the answer", or make the judgment for them. Respond with a question that helps them think, or point them to something they could explore on their own. Never tell them what the correct answer is.

If the student asks you to do the thinking for them THREE TIMES IN A ROW, say so plainly:
"It looks like you want me to do the thinking for you. I won't. Go write out your best guess - even a bad one - and come back. I'll push back on what you wrote."

Hard rules, always:
- Never write sentences, paragraphs, or drafts the student could paste as their own.
- Never produce a model answer "for their reference".
- Keep every response under 180 words.
- If they seem genuinely stuck, offer a specific hint - not the answer.

Topic: ${concept}
Learning objective: ${lesson.learning_objective}`,
    framework_warnings: lesson.framework_warnings ?? [],
  };
}

function ShareLessonCard({
  lesson,
  concept,
  gradeLevel,
  timeMinutes,
}: {
  lesson: LessonPlan;
  concept: string;
  gradeLevel: string;
  timeMinutes: number;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function makeAvailable() {
    setBusy(true);
    setErr(null);
    try {
      const shared = lessonToSharedPlan(lesson, concept, gradeLevel, timeMinutes);
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: shared }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || `HTTP ${res.status}`);
        return;
      }
      setUrl(`${window.location.origin}/student/${data.id}`);
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
            Ready to share
          </div>
          <h3 className="text-base font-semibold text-foreground mt-0.5">
            Make this lesson available to students
          </h3>
          <p className="text-xs text-muted mt-1">
            One URL. Students walk through the three phases on their own - first
            attempt, then AI tutor, then reflection.
          </p>
        </div>
        <button
          type="button"
          onClick={makeAvailable}
          disabled={busy}
          className="rounded-full bg-foreground text-surface px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity whitespace-nowrap self-start md:self-auto"
        >
          {busy ? "Preparing…" : "Make available →"}
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
          Available to students
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
      <div className="mt-3 text-xs">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-foreground font-medium hover:underline"
        >
          Preview as a student ↗
        </a>
        <span className="text-muted ml-2">
          See what your class will see. On Railway, this URL works on any device.
        </span>
      </div>
    </section>
  );
}
