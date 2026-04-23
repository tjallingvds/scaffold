"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AssignmentPlan, AssignmentStep } from "@/lib/types";
import {
  AccessibilityMenu,
  TUTOR_ADAPTATIONS,
  a11yClass,
  useAccessibility,
} from "./Accessibility";
import { SpeakButton } from "./SpeakButton";
import { Help } from "../../_shared/Help";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

type Step = "welcome" | "phase1" | "phase2" | "phase3" | "submit";

// No hard cap on AI exchanges - the tutor itself is strict (answers informational
// questions, refuses to do the thinking). A soft nudge appears after this many.
const SOFT_NUDGE_AFTER = 5;
const MIN_PHASE1_CHARS = 120;

interface EffortCheck {
  effort_shown: boolean;
  feedback: string;
  encouragement: string;
}

// Optional opening moves. A student can pick one to autofill the input - or
// just ask anything freely. The AI tutor's rules apply regardless.
const STARTER_MOVES: { label: string; prompt: string }[] = [
  {
    label: "Challenge my thinking",
    prompt: "Challenge the strongest claim in what I just wrote. Push back hard.",
  },
  {
    label: "Find a counterexample",
    prompt: "Give me a counterexample that would break my reasoning.",
  },
  {
    label: "Steel-man the other side",
    prompt: "Give me the strongest version of the view opposing mine. Help me take it seriously.",
  },
  {
    label: "What am I missing?",
    prompt: "What's a perspective or factor I probably haven't considered?",
  },
  {
    label: "Define a term",
    prompt: "I want to check a definition. Can you explain: ",
  },
  {
    label: "What happens in…",
    prompt: "I want to check the facts. Can you remind me what happens / what's true about: ",
  },
];

function findStep(plan: AssignmentPlan, phase: AssignmentStep["phase"]): AssignmentStep | undefined {
  return plan.student_steps.find((s) => s.phase === phase);
}

interface Saved {
  step: Step;
  groupLabel: string;
  known: string;
  confused: string;
  tried: string;
  draft: string;
  chat: ChatTurn[];
  reflection1: string;
  reflection2: string;
  reflection3: string;
}

function storageKey(shareId: string): string {
  return `scaffold.student.${shareId}`;
}

function readSaved(shareId: string): Partial<Saved> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(shareId));
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Saved>;
  } catch {
    return {};
  }
}

export function StudentWorkspace({
  plan,
  shareId,
}: {
  plan: AssignmentPlan;
  shareId: string;
}) {
  const { prefs: a11y, setPrefs: setA11y } = useAccessibility();

  // Initial state is read from localStorage synchronously so we never re-hydrate
  // via setState-in-effect (which React 19 flags).
  const saved = useMemo(() => readSaved(shareId), [shareId]);

  const [step, setStep] = useState<Step>(saved.step ?? "welcome");

  // Optional group/pair label (e.g. "Alex + Sam" or "Group 3"). Lets the
  // teacher tell submissions apart when students share one device.
  const [groupLabel, setGroupLabel] = useState(saved.groupLabel ?? "");

  // Phase 1
  const [known, setKnown] = useState(saved.known ?? "");
  const [confused, setConfused] = useState(saved.confused ?? "");
  const [tried, setTried] = useState(saved.tried ?? "");

  // Effort check
  const [checkBusy, setCheckBusy] = useState(false);
  const [checkResult, setCheckResult] = useState<EffortCheck | null>(null);

  // Phase 2 - the real answer the student is writing + the tutor chat beside it
  const [draft, setDraft] = useState(saved.draft ?? "");
  const [chat, setChat] = useState<ChatTurn[]>(saved.chat ?? []);
  const [pendingMessage, setPendingMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Phase 3
  const [reflection1, setReflection1] = useState(saved.reflection1 ?? "");
  const [reflection2, setReflection2] = useState(saved.reflection2 ?? "");
  const [reflection3, setReflection3] = useState(saved.reflection3 ?? "");

  // Persist everything to localStorage on any change.
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey(shareId),
        JSON.stringify({
          step,
          groupLabel,
          known,
          confused,
          tried,
          draft,
          chat,
          reflection1,
          reflection2,
          reflection3,
        }),
      );
    } catch {
      /* ignore quota errors */
    }
  }, [
    shareId,
    step,
    groupLabel,
    known,
    confused,
    tried,
    draft,
    chat,
    reflection1,
    reflection2,
    reflection3,
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.length, isSending]);

  const combinedAttempt = [
    `What I already know:\n${known.trim()}`,
    `What I'm confused about:\n${confused.trim()}`,
    `What I've tried:\n${tried.trim()}`,
  ].join("\n\n");

  const totalChars =
    known.trim().length + confused.trim().length + tried.trim().length;
  const minCharsMet = totalChars >= MIN_PHASE1_CHARS;
  const allFieldsFilled =
    known.trim().length >= 20 &&
    confused.trim().length >= 10 &&
    tried.trim().length >= 10;
  const phase1LengthReady = minCharsMet && allFieldsFilled;

  const exchangesUsed = chat.filter((t) => t.role === "user").length;
  const softNudge = exchangesUsed >= SOFT_NUDGE_AFTER;
  const phase2Ready = exchangesUsed >= 1;

  const phase3Ready =
    reflection1.trim().length >= 40 &&
    reflection2.trim().length >= 40 &&
    reflection3.trim().length >= 40;

  async function runEffortCheck() {
    setCheckBusy(true);
    setCheckResult(null);
    try {
      const res = await fetch("/api/effort-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: plan.topic,
          attempt: combinedAttempt,
          profile: a11y.profile ?? undefined,
        }),
      });
      const data = (await res.json()) as EffortCheck;
      setCheckResult(data);
      if (data.effort_shown) setTimeout(() => setStep("phase2"), 600);
    } catch {
      setStep("phase2");
    } finally {
      setCheckBusy(false);
    }
  }

  async function sendMessage(rawText?: string) {
    const content = (rawText ?? pendingMessage).trim();
    if (!content) return;
    setIsSending(true);
    setChatError(null);
    const nextChat: ChatTurn[] = [...chat, { role: "user", content }];
    setChat(nextChat);
    setPendingMessage("");

    // Build the system prompt on every turn so the tutor always sees:
    // (a) the base Socratic rules, (b) any accessibility adaptation,
    // (c) the CURRENT draft (not a stale one from when chat began),
    // (d) whether the student is working solo or in a pair/group.
    const base = plan.student_system_prompt;
    const adaptation = a11y.profile ? TUTOR_ADAPTATIONS[a11y.profile] : "";
    const currentDraft = draft.trim();
    const draftSection = currentDraft
      ? `CURRENT STUDENT DRAFT (may have been edited since your last reply. Always refer to THIS version, not what was in an earlier message):\n"""\n${currentDraft}\n"""`
      : `The student has not written a draft yet. Your job right now is to nudge them to write something of their own, even a rough sentence, rather than asking you for ideas first.`;
    const groupSection = groupLabel.trim()
      ? `CONTEXT: This is not a solo student. They are working in a pair or small group, labeled "${groupLabel.trim()}". Address them as "you two" or "your group" rather than "you". Encourage them to say who is thinking what when they answer, and to disagree with each other out loud.`
      : "";
    const systemWithContext = [base, adaptation, draftSection, groupSection]
      .filter(Boolean)
      .join("\n\n");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemWithContext,
          messages: nextChat,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatError(data.error || `Request failed (${res.status})`);
        return;
      }
      setChat((c) => [...c, { role: "assistant", content: data.reply as string }]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSending(false);
    }
  }

  const compiledSubmission = useMemo(() => {
    const transcript =
      chat.length === 0
        ? "(no AI exchanges)"
        : chat
            .map((t) => `${t.role === "user" ? "STUDENT" : "AI TUTOR"}: ${t.content}`)
            .join("\n\n");
    return [
      `STUDENT SUBMISSION`,
      `Assignment: ${plan.title}`,
      `Topic: ${plan.topic}`,
      `Submitted: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
      `AI rounds: ${exchangesUsed}`,
      "",
      "=== PHASE 1 - INITIAL UNASSISTED ATTEMPT ===",
      combinedAttempt,
      "",
      "=== PHASE 2 - MY DRAFT ===",
      draft.trim() || "(no draft yet)",
      "",
      "=== PHASE 2 - AI INTERACTION LOG (VERBATIM) ===",
      transcript,
      "",
      "=== PHASE 3 - REFLECTION ===",
      "",
      "What changed in my thinking:",
      reflection1.trim(),
      "",
      "Which AI suggestions I accepted or rejected, and why:",
      reflection2.trim(),
      "",
      "What I am still uncertain about:",
      reflection3.trim(),
    ].join("\n");
  }, [plan, combinedAttempt, draft, chat, exchangesUsed, reflection1, reflection2, reflection3]);

  const phase1Step = findStep(plan, "pre_engagement");
  const phase2Step = findStep(plan, "guided_engagement");
  const phase3Step = findStep(plan, "reflective_engagement");

  return (
    <div className={`min-h-screen bg-surface flex flex-col ${a11yClass(a11y)}`}>
      <header className="bg-chrome text-chrome-ink px-3 sm:px-5 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-accent-ink text-white text-xs font-bold flex-shrink-0"
            >
              S
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.14em] text-chrome-muted font-semibold">
                Assignment · Grade {plan.grade_level} · ~{plan.time_minutes} min
                {groupLabel.trim() && ` · ${groupLabel.trim()}`}
              </div>
              <h1 className="font-display text-base md:text-lg text-chrome-ink leading-tight truncate">
                {plan.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {a11y.show_timer && (
              <PhaseTimer
                key={step}
                step={step}
                planTotal={plan.time_minutes}
                steps={plan.student_steps}
              />
            )}
            <MiniProgress step={step} />
            <AccessibilityMenu prefs={a11y} setPrefs={setA11y} />
          </div>
        </header>

      <div
        data-student-grid
        className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 grid lg:grid-cols-[1fr_260px] gap-6 lg:gap-10 flex-1"
      >
        <main className="min-w-0">
          <div key={step} className="animate-[fadeIn_.25s_ease-out]">
            {step === "welcome" && (
              <Welcome
                plan={plan}
                groupLabel={groupLabel}
                setGroupLabel={setGroupLabel}
                onStart={() => setStep("phase1")}
              />
            )}

            {step === "phase1" && (
              <Phase1
                stepInstructions={phase1Step}
                known={known}
                setKnown={setKnown}
                confused={confused}
                setConfused={setConfused}
                tried={tried}
                setTried={setTried}
                totalChars={totalChars}
                ready={phase1LengthReady}
                onAdvance={runEffortCheck}
                checkBusy={checkBusy}
                checkResult={checkResult}
                onBack={() => setStep("welcome")}
              />
            )}

            {step === "phase2" && (
              <Phase2
                stepInstructions={phase2Step}
                draft={draft}
                setDraft={setDraft}
                chat={chat}
                pendingMessage={pendingMessage}
                setPendingMessage={setPendingMessage}
                sendMessage={sendMessage}
                isSending={isSending}
                exchangesUsed={exchangesUsed}
                softNudge={softNudge}
                error={chatError}
                ready={phase2Ready && draft.trim().length >= 80}
                onAdvance={() => setStep("phase3")}
                onBack={() => setStep("phase1")}
                scrollRef={scrollRef}
              />
            )}

            {step === "phase3" && (
              <Phase3
                stepInstructions={phase3Step}
                reflection1={reflection1}
                setReflection1={setReflection1}
                reflection2={reflection2}
                setReflection2={setReflection2}
                reflection3={reflection3}
                setReflection3={setReflection3}
                ready={phase3Ready}
                onAdvance={() => setStep("submit")}
                onBack={() => setStep("phase2")}
              />
            )}

            {step === "submit" && (
              <SubmitView
                plan={plan}
                shareId={shareId}
                profile={a11y.profile}
                groupLabel={groupLabel}
                known={known}
                confused={confused}
                tried={tried}
                draft={draft}
                chat={chat}
                exchangesUsed={exchangesUsed}
                reflection1={reflection1}
                reflection2={reflection2}
                reflection3={reflection3}
                compiled={compiledSubmission}
                onBack={() => setStep("phase3")}
              />
            )}
          </div>

          <footer className="mt-12 pt-5 border-t border-border text-xs text-muted leading-relaxed flex items-center justify-end gap-4">
            <span className="font-mono opacity-60 whitespace-nowrap">#{shareId}</span>
          </footer>
        </main>

        <JourneyRail
          step={step}
          plan={plan}
          phase1Done={step === "phase2" || step === "phase3" || step === "submit"}
          phase2Done={step === "phase3" || step === "submit"}
          phase3Done={step === "submit"}
          known={known}
          confused={confused}
          tried={tried}
          chat={chat}
          exchangesUsed={exchangesUsed}
          reflection1={reflection1}
          reflection2={reflection2}
          reflection3={reflection3}
        />
      </div>


      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ---------- Header progress ----------

function PhaseTimer({
  step,
  planTotal,
  steps,
}: {
  step: Step;
  planTotal: number;
  steps: AssignmentStep[];
}) {
  // Keyed on `step` via parent; use useState initializer so reset is free.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const stepTime =
    step === "phase1"
      ? steps.find((s) => s.phase === "pre_engagement")?.time_minutes ?? Math.round(planTotal * 0.3)
      : step === "phase2"
        ? steps.find((s) => s.phase === "guided_engagement")?.time_minutes ?? Math.round(planTotal * 0.45)
        : step === "phase3"
          ? steps.find((s) => s.phase === "reflective_engagement")?.time_minutes ?? Math.round(planTotal * 0.25)
          : 0;

  if (step === "welcome" || step === "submit" || stepTime === 0) return null;

  const totalSec = stepTime * 60;
  const remaining = Math.max(0, totalSec - elapsed);
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const over = elapsed > totalSec;

  return (
    <div
      className={`text-[10px] uppercase tracking-wider font-mono rounded-full px-2.5 py-1 border ${
        over
          ? "border-warn text-warn bg-warn-soft"
          : "border-chrome-soft text-chrome-muted bg-chrome-soft"
      }`}
      title={over ? "Past suggested time. Keep going if you need to." : "Suggested time for this step"}
    >
      {over ? `+${Math.floor((elapsed - totalSec) / 60)}m over` : `${mm}:${ss.toString().padStart(2, "0")} left`}
    </div>
  );
}

function MiniProgress({ step }: { step: Step }) {
  const idx =
    step === "welcome"
      ? 0
      : step === "phase1"
        ? 1
        : step === "phase2"
          ? 2
          : step === "phase3"
            ? 3
            : 4;
  const pct = (idx / 4) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block relative h-1.5 w-32 bg-chrome-soft rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-chrome-ink transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-chrome-muted whitespace-nowrap">
        {idx}/4
      </span>
    </div>
  );
}

// ---------- Welcome ----------

function Welcome({
  plan,
  groupLabel,
  setGroupLabel,
  onStart,
}: {
  plan: AssignmentPlan;
  groupLabel: string;
  setGroupLabel: (v: string) => void;
  onStart: () => void;
}) {
  const p1 = findStep(plan, "pre_engagement");
  const p2 = findStep(plan, "guided_engagement");
  const p3 = findStep(plan, "reflective_engagement");
  const items = [
    { n: 1, step: p1, badge: "AI off", fallbackLabel: "Think for yourself" },
    { n: 2, step: p2, badge: "Bounded AI", fallbackLabel: "Talk to an AI tutor" },
    { n: 3, step: p3, badge: "Your voice", fallbackLabel: "Reflect" },
  ];

  return (
    <section className="flex flex-col gap-7">
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-accent font-semibold mb-1">
          Welcome
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground leading-[1.1] inline-flex items-start">
          Three steps. About {plan.time_minutes} minutes.
          <Help label="Why three steps">
            <p className="font-medium mb-1">Why it works this way.</p>
            <p>
              Students who lean on AI too early often stop thinking for themselves. So Step 1 is yours alone: no AI. Step 2 adds an AI tutor built to ask you questions, not answer them. Step 3 is a short reflection in your own voice. That order protects your thinking.
            </p>
          </Help>
        </h2>
        <p className="text-base text-muted leading-relaxed mt-3 max-w-2xl">
          Step 1: think for yourself, no AI. Step 2: talk to an AI tutor about what you wrote. It won&rsquo;t hand you an answer; it&rsquo;ll push back. Step 3: reflect on what changed.
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {items.map(({ n, step, badge, fallbackLabel }) => (
          <li
            key={n}
            className="rounded-2xl border border-border bg-surface p-5 flex items-start gap-4 hover:border-accent/40 transition-colors"
          >
            <span
              aria-hidden
              className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-soft border border-accent/30 text-accent-ink font-semibold flex items-center justify-center text-base"
            >
              {n}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div className="text-base font-semibold text-foreground">
                  {step?.title || fallbackLabel}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider bg-subtle text-muted px-2 py-0.5 rounded">
                    {badge}
                  </span>
                  {step && (
                    <span className="text-xs text-muted whitespace-nowrap">
                      ~{step.time_minutes} min
                    </span>
                  )}
                </div>
              </div>
              {step?.instructions && (
                <div className="text-sm text-muted leading-relaxed mt-1.5 line-clamp-2">
                  {step.instructions}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Working with a partner or small group?
        </label>
        <p className="text-xs text-muted leading-relaxed">
          Optional. Enter a label so your teacher can tell your submission
          apart. Example: <em>Alex + Sam</em> or <em>Group 3</em>. Leave blank
          if you&rsquo;re working solo.
        </p>
        <input
          type="text"
          value={groupLabel}
          onChange={(e) => setGroupLabel(e.target.value)}
          placeholder="Your names or a group label"
          maxLength={80}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-foreground transition-colors"
        />
      </div>

      <button
        onClick={onStart}
        className="self-end rounded-full bg-accent text-white px-6 py-3 text-sm font-medium hover:bg-accent-ink transition-colors shadow-sm hover:shadow"
      >
        Start step 1 →
      </button>

    </section>
  );
}

// ---------- Task banner shown at top of every phase ----------

function TaskBanner({
  stepNumber,
  step,
  badge,
}: {
  stepNumber: 1 | 2 | 3;
  step?: AssignmentStep;
  badge: string;
}) {
  if (!step) return null;
  return (
    <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent-soft/70 via-surface to-surface p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-semibold"
          >
            {stepNumber}
          </span>
          <div className="text-[10px] uppercase tracking-[0.14em] text-accent font-semibold">
            Your task · {badge} · {step.time_minutes} min
          </div>
        </div>
        <SpeakButton
          text={`${step.title}. ${step.instructions}${
            step.deliverable ? ` What you'll turn in: ${step.deliverable}` : ""
          }`}
        />
      </div>
      <h2 className="font-display text-xl text-foreground leading-tight">
        {step.title}
      </h2>
      <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
        {step.instructions}
      </p>
      {step.deliverable && (
        <div className="text-xs text-muted mt-1 border-t border-border/60 pt-2">
          <span className="font-medium text-foreground">What you&rsquo;ll turn in:</span>{" "}
          {step.deliverable}
        </div>
      )}
    </div>
  );
}

// ---------- Stepper (kept for accessible narration, visually minimal now) ----------

// ---------- Phase 1 ----------

function Phase1({
  stepInstructions,
  known,
  setKnown,
  confused,
  setConfused,
  tried,
  setTried,
  totalChars,
  ready,
  onAdvance,
  checkBusy,
  checkResult,
  onBack,
}: {
  stepInstructions?: AssignmentStep;
  known: string;
  setKnown: (v: string) => void;
  confused: string;
  setConfused: (v: string) => void;
  tried: string;
  setTried: (v: string) => void;
  totalChars: number;
  ready: boolean;
  onAdvance: () => void;
  checkBusy: boolean;
  checkResult: EffortCheck | null;
  onBack: () => void;
}) {
  const effortFailed = checkResult && !checkResult.effort_shown;
  return (
    <section className="flex flex-col gap-5">
      <TaskBanner stepNumber={1} step={stepInstructions} badge="AI off" />

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-base font-semibold text-foreground inline-flex items-center">
            Answer these three questions first
            <Help label="Why these three questions">
              <p className="mb-1">
                Before the AI shows up, you&rsquo;re writing down what&rsquo;s already in your head. This is how you find the gaps in your own thinking.
              </p>
              <p>
                It&rsquo;s fine to be wrong or confused right now. You&rsquo;re not being graded on these answers; you&rsquo;re using them to figure out what to ask the AI tutor later.
              </p>
            </Help>
          </h3>
          <span className="text-[10px] uppercase tracking-wider bg-subtle text-muted px-2 py-0.5 rounded">
            Your thinking only
          </span>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Confused or wrong is fine. Messy thinking is still thinking. Answer in any order.
        </p>
      </div>

      <ThinkingField
        label="What do you already know about this?"
        hint="Two or three sentences. Facts, intuitions, half-formed ideas all count."
        value={known}
        onChange={setKnown}
        placeholder="I think… / I remember that…"
      />
      <ThinkingField
        label="What is confusing?"
        hint="Name the specific thing. Not just &ldquo;everything.&rdquo;"
        value={confused}
        onChange={setConfused}
        placeholder="I'm not sure how / why / whether…"
      />
      <ThinkingField
        label="What have you already tried or considered?"
        hint="Notes, a quick guess, a hunch. Whatever you&rsquo;ve already thought about."
        value={tried}
        onChange={setTried}
        placeholder="I tried… / My first guess was…"
      />

      {checkResult?.effort_shown && (
        <div className="rounded-lg border border-accent/25 bg-accent-soft/50 px-4 py-3 text-sm flex items-start gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs font-semibold">
            ✓
          </span>
          <div className="flex-1">
            <div className="text-accent-ink font-medium">Nice work. Unlocking AI.</div>
            {checkResult.feedback && (
              <p className="text-foreground/80 text-xs mt-0.5">{checkResult.feedback}</p>
            )}
          </div>
        </div>
      )}

      {effortFailed && (
        <div className="rounded-lg border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          <div className="font-medium mb-1">One more pass before AI unlocks</div>
          <p className="text-foreground/80">{checkResult.feedback}</p>
          {checkResult.encouragement && (
            <p className="text-foreground/70 text-xs mt-1.5 italic">
              {checkResult.encouragement}
            </p>
          )}
        </div>
      )}

      <StickyActionBar
        left={
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-sm text-muted hover:text-foreground transition-colors">
              ← Back
            </button>
            <span className="text-xs text-muted">
              {totalChars} characters.{" "}
              {ready ? (
                <span className="text-accent font-medium">Ready to continue.</span>
              ) : (
                <>Write something in each of the three boxes.</>
              )}
            </span>
          </div>
        }
        right={
          <button
            onClick={onAdvance}
            disabled={!ready || checkBusy}
            className="rounded-full bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
          >
            {checkBusy ? (
              <>
                <Spinner /> Checking your answers…
              </>
            ) : (
              <>Continue to step 2 →</>
            )}
          </button>
        }
      />
    </section>
  );
}

function ThinkingField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <span className="text-xs text-muted">{hint}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}

// ---------- Phase 2 ----------

function Phase2({
  stepInstructions,
  draft,
  setDraft,
  chat,
  pendingMessage,
  setPendingMessage,
  sendMessage,
  isSending,
  exchangesUsed,
  softNudge,
  error,
  ready,
  onAdvance,
  onBack,
  scrollRef,
}: {
  stepInstructions?: AssignmentStep;
  draft: string;
  setDraft: (v: string) => void;
  chat: ChatTurn[];
  pendingMessage: string;
  setPendingMessage: (v: string) => void;
  sendMessage: (text?: string) => void;
  isSending: boolean;
  exchangesUsed: number;
  softNudge: boolean;
  error: string | null;
  ready: boolean;
  onAdvance: () => void;
  onBack: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="flex flex-col gap-5">
      <TaskBanner stepNumber={2} step={stepInstructions} badge="With AI tutor" />

      {/* The real work surface. Student writes their actual answer here. */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground inline-flex items-center">
            Your draft
            <Help label="About your draft">
              <p className="mb-1">
                This is the answer you turn in. Write it in your own words.
              </p>
              <p>
                Don&rsquo;t paste AI text into this box. Write what you&rsquo;d
                say if you had to defend the idea in class. Then use the tutor
                below to poke holes in what you wrote.
              </p>
            </Help>
          </h3>
          <span className="text-[10px] uppercase tracking-wider bg-subtle text-muted px-2 py-0.5 rounded">
            You turn this in
          </span>
        </div>
        <p className="text-sm text-muted leading-relaxed mb-3">
          Write your real answer to the task here. In your own words. The tutor
          below can challenge it, but this box stays yours.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={10}
          placeholder="My argument is… / I think… / Here's what I'd say if asked…"
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-foreground"
        />
        <div className="mt-2 text-xs text-muted">
          {draft.trim().length} characters.
          {draft.trim().length >= 80 && (
            <span className="text-foreground font-medium ml-1">
              Long enough.
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <header className="flex items-center justify-between gap-4 px-5 py-3 border-b border-border bg-gradient-to-r from-accent-soft/40 to-transparent">
          <div className="flex items-center gap-3">
            <AIAvatar />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground inline-flex items-center">
                AI tutor
                <Help label="About the tutor">
                  <p className="mb-2">
                    This tutor is different from regular ChatGPT. Two rules it follows:
                  </p>
                  <ul className="list-disc pl-4 flex flex-col gap-1">
                    <li>
                      <strong>Facts &amp; definitions:</strong> it answers normally (short and to the point).
                    </li>
                    <li>
                      <strong>&ldquo;Tell me the answer&rdquo; questions:</strong> it refuses and asks you a question back instead.
                    </li>
                  </ul>
                  <p className="mt-2">
                    If you keep asking it to do the thinking, it will call that out. It sees your current draft, so asking &ldquo;what&rsquo;s wrong with this?&rdquo; works.
                  </p>
                </Help>
              </div>
              <div className="text-xs text-muted leading-tight">
                Ask about your draft. It pushes back, it doesn&rsquo;t write for you.
              </div>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted whitespace-nowrap inline-flex items-center">
            Round {exchangesUsed || 0}
            <Help label="What&rsquo;s a round" align="right">
              <p>
                One round equals you asking the tutor something and the tutor replying once. There&rsquo;s no hard limit, but after about five rounds the tutor usually isn&rsquo;t adding much. Keep going if it&rsquo;s still useful.
              </p>
            </Help>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="min-h-[280px] max-h-[500px] overflow-y-auto px-6 py-5 flex flex-col gap-4 scroll-smooth"
        >
          {chat.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              <p className="text-sm text-muted italic text-center max-w-md">
                Ask anything, or pick a move below to get started.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                {STARTER_MOVES.map((m, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      m.prompt.endsWith(" ")
                        ? setPendingMessage(m.prompt)
                        : sendMessage(m.prompt)
                    }
                    disabled={isSending}
                    className="text-xs rounded-full border border-border bg-surface hover:border-accent hover:bg-accent-soft text-foreground px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chat.map((turn, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${turn.role === "user" ? "justify-end" : "justify-start"} animate-[fadeIn_.2s_ease-out]`}
            >
              {turn.role === "assistant" && <AIAvatar compact />}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  turn.role === "user"
                    ? "bg-accent text-white rounded-br-sm"
                    : "bg-subtle text-foreground rounded-bl-sm"
                }`}
              >
                {turn.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex gap-2.5 justify-start">
              <AIAvatar compact />
              <div className="bg-subtle rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-muted flex items-center gap-2">
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
                </span>
                thinking
              </div>
            </div>
          )}
        </div>

        {softNudge && (
          <div className="border-t border-border bg-subtle/60 px-5 py-2.5 text-xs text-muted flex items-start gap-2">
            <span className="text-accent-ink" aria-hidden>
              ◆
            </span>
            <span>
              You&rsquo;ve had {exchangesUsed} rounds with the tutor. That&rsquo;s usually plenty. Keep going if it&rsquo;s still useful, or move on to the reflection when you&rsquo;re ready.
            </span>
          </div>
        )}

        {error && (
          <div className="border-t border-error/30 bg-error-soft px-6 py-2 text-xs text-error">
            {error}
          </div>
        )}

        <div className="border-t border-border bg-subtle/50 px-4 py-3">
          <textarea
            value={pendingMessage}
            onChange={(e) => setPendingMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask the tutor something a textbook couldn&rsquo;t answer for you."
            rows={2}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm resize-none outline-none transition-colors focus:border-accent"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted">
              ⌘/Ctrl + Enter to send
            </span>
            <button
              onClick={() => sendMessage()}
              disabled={!pendingMessage.trim() || isSending}
              className="rounded-md bg-accent text-white px-4 py-1.5 text-sm font-medium hover:bg-accent-ink disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <StickyActionBar
        left={
          <button onClick={onBack} className="text-sm text-muted hover:text-foreground transition-colors">
            ← Back
          </button>
        }
        right={
          <button
            onClick={onAdvance}
            disabled={!ready}
            className="rounded-full bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-ink disabled:opacity-40 transition-colors shadow-sm"
          >
            Continue to reflection →
          </button>
        }
      />
    </section>
  );
}

function AIAvatar({ compact = false }: { compact?: boolean }) {
  const size = compact ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  return (
    <div
      aria-hidden
      className={`${size} rounded-full bg-gradient-to-br from-accent to-accent-ink text-white flex-shrink-0 font-semibold flex items-center justify-center shadow-sm`}
    >
      AI
    </div>
  );
}

// ---------- Phase 3 ----------

function Phase3({
  stepInstructions,
  reflection1,
  setReflection1,
  reflection2,
  setReflection2,
  reflection3,
  setReflection3,
  ready,
  onAdvance,
  onBack,
}: {
  stepInstructions?: AssignmentStep;
  reflection1: string;
  setReflection1: (v: string) => void;
  reflection2: string;
  setReflection2: (v: string) => void;
  reflection3: string;
  setReflection3: (v: string) => void;
  ready: boolean;
  onAdvance: () => void;
  onBack: () => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <TaskBanner stepNumber={3} step={stepInstructions} badge="Your voice" />

      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-base font-semibold text-foreground mb-1 inline-flex items-center">
          Three short reflection questions
          <Help label="Why reflect">
            <p className="mb-1">
              This is where the work becomes learning you actually keep.
            </p>
            <p>
              Honest beats polished. A short, specific answer about one thing you changed is worth more than a long, vague one.
            </p>
          </Help>
        </h3>
        <p className="text-sm text-muted leading-relaxed">
          Answer in your own words. Your teacher sees these alongside your draft.
        </p>
      </div>

      <ThinkingField
        label="What changed in your thinking?"
        hint="Compare your first attempt to where you are now. Name one specific thing that shifted."
        value={reflection1}
        onChange={setReflection1}
        placeholder="My first instinct was… but now I think…"
      />
      <ThinkingField
        label="Which AI suggestions did you take, and which did you reject? Why?"
        hint="Rejecting with a reason is often stronger than accepting."
        value={reflection2}
        onChange={setReflection2}
        placeholder="I used the idea that… I didn&rsquo;t take the suggestion to… because…"
      />
      <ThinkingField
        label="What are you still uncertain about?"
        hint="The edges of your understanding. Name one thing, not ten."
        value={reflection3}
        onChange={setReflection3}
        placeholder="I&rsquo;m still not sure about…"
      />
      <StickyActionBar
        left={
          <button onClick={onBack} className="text-sm text-muted hover:text-foreground transition-colors">
            ← Back
          </button>
        }
        right={
          <button
            onClick={onAdvance}
            disabled={!ready}
            className="rounded-full bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-ink disabled:opacity-40 transition-colors shadow-sm"
          >
            Continue to submit →
          </button>
        }
      />
    </section>
  );
}

// ---------- Submit ----------

function SubmitView({
  plan,
  shareId,
  profile,
  groupLabel,
  known,
  confused,
  tried,
  draft,
  chat,
  exchangesUsed,
  reflection1,
  reflection2,
  reflection3,
  compiled,
  onBack,
}: {
  plan: AssignmentPlan;
  shareId: string;
  profile: string | null;
  groupLabel: string;
  known: string;
  confused: string;
  tried: string;
  draft: string;
  chat: ChatTurn[];
  exchangesUsed: number;
  reflection1: string;
  reflection2: string;
  reflection3: string;
  compiled: string;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submitToTeacher() {
    setSubmitStatus("sending");
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_id: shareId,
          data: {
            assignment_title: plan.title,
            assignment_topic: plan.topic,
            submitted_at: new Date().toISOString(),
            phase1: { known, confused, tried },
            draft,
            chat,
            exchanges_used: exchangesUsed,
            reflection: {
              changed: reflection1,
              accepted_rejected: reflection2,
              uncertain: reflection3,
            },
            accessibility_profile: profile,
            group_label: groupLabel.trim() || null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || `HTTP ${res.status}`);
        setSubmitStatus("error");
        return;
      }
      setSubmitStatus("sent");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submit failed");
      setSubmitStatus("error");
    }
  }
  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent-soft/70 via-surface to-surface p-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            aria-hidden
            className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-semibold"
          >
            ✓
          </span>
          <div className="text-[10px] uppercase tracking-[0.14em] text-accent font-semibold">
            You&rsquo;re done
          </div>
        </div>
        <h2 className="font-display text-2xl text-foreground mb-1 inline-flex items-center leading-tight">
          Here&rsquo;s everything you did.
          <Help label="What your teacher sees">
            <p className="mb-1">When you tap <strong>Submit to your teacher</strong>:</p>
            <ul className="list-disc pl-4 flex flex-col gap-1">
              <li>They see your Step 1 answers, your draft, the tutor conversation, and your reflection.</li>
              <li>They don&rsquo;t see your name (Scaffold doesn&rsquo;t ask for it).</li>
              <li>They don&rsquo;t see the accessibility settings you picked.</li>
            </ul>
            <p className="mt-2">
              If your class also wants a plain-text copy (paste it into a doc, email, an LMS), the <em>Copy text</em> button gives you that.
            </p>
          </Help>
        </h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Review it. Then submit to your teacher below, or copy the text if your class uses something else.
        </p>
      </div>

      <SubmitSection title="Step 1 · First attempt" badge="AI off">
        <SubmitField label="What you already knew" value={known} />
        <SubmitField label="What confused you" value={confused} />
        <SubmitField label="What you had tried" value={tried} />
      </SubmitSection>

      <SubmitSection title="Step 2 · My draft">
        <SubmitField label="What I wrote" value={draft} />
      </SubmitSection>

      <SubmitSection
        title="Step 2 · With the AI tutor"
        badge={`${exchangesUsed} round${exchangesUsed === 1 ? "" : "s"}`}
      >
        {chat.length === 0 ? (
          <p className="text-sm italic text-muted">(No AI exchanges used.)</p>
        ) : (
          <div className="flex flex-col gap-3">
            {chat.map((t, i) => (
              <div key={i} className="text-sm">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted mb-0.5">
                  {t.role === "user" ? "You" : "AI tutor"}
                </div>
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {t.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </SubmitSection>

      <SubmitSection title="Step 3 · Reflection" badge="Your voice">
        <SubmitField label="What changed in my thinking" value={reflection1} />
        <SubmitField
          label="Which AI suggestions I accepted or rejected, and why"
          value={reflection2}
        />
        <SubmitField label="What I'm still uncertain about" value={reflection3} />
      </SubmitSection>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowRaw((s) => !s)}
          className="text-xs text-muted hover:text-foreground self-start"
        >
          {showRaw ? "Hide plain-text version" : "Show plain-text version to copy"}
        </button>
        {showRaw && (
          <textarea
            readOnly
            value={compiled}
            rows={14}
            className="w-full bg-surface border border-border rounded-lg px-4 py-4 text-xs font-mono leading-relaxed outline-none"
          />
        )}
      </div>

      <StickyActionBar
        left={
          <button onClick={onBack} className="text-sm text-muted hover:text-foreground transition-colors">
            ← Back
          </button>
        }
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(compiled);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-full border border-border bg-surface text-foreground px-4 py-2.5 text-sm font-medium hover:border-foreground transition-colors"
            >
              {copied ? "✓ Copied" : "Copy text"}
            </button>
            <button
              onClick={submitToTeacher}
              disabled={submitStatus === "sending" || submitStatus === "sent"}
              className="rounded-full bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-ink transition-colors shadow-sm disabled:opacity-70"
            >
              {submitStatus === "sending"
                ? "Sending…"
                : submitStatus === "sent"
                  ? "✓ Sent to your teacher"
                  : "Submit to your teacher"}
            </button>
          </div>
        }
      />
      {submitError && (
        <div className="text-xs text-error text-right -mt-2">{submitError}</div>
      )}

      <p className="text-xs text-muted text-center mt-2">
        Assignment: <strong className="text-foreground font-medium">{plan.title}</strong>
      </p>
    </section>
  );
}

function SubmitSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <header className="border-b border-border px-5 py-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider bg-subtle text-muted px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </header>
      <div className="px-5 py-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function SubmitField({ label, value }: { label: string; value: string }) {
  if (!value?.trim()) return null;
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
        {label}
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {value.trim()}
      </p>
    </div>
  );
}

// ---------- Journey rail ----------

function JourneyRail({
  step,
  plan,
  phase1Done,
  phase2Done,
  phase3Done,
  known,
  confused,
  tried,
  chat,
  exchangesUsed,
  reflection1,
  reflection2,
  reflection3,
}: {
  step: Step;
  plan: AssignmentPlan;
  phase1Done: boolean;
  phase2Done: boolean;
  phase3Done: boolean;
  known: string;
  confused: string;
  tried: string;
  chat: ChatTurn[];
  exchangesUsed: number;
  reflection1: string;
  reflection2: string;
  reflection3: string;
}) {
  const p1 = findStep(plan, "pre_engagement");
  const p2 = findStep(plan, "guided_engagement");
  const p3 = findStep(plan, "reflective_engagement");

  const phaseState = (done: boolean, active: boolean): "done" | "active" | "idle" =>
    done ? "done" : active ? "active" : "idle";

  return (
    <aside data-role="student-rail" className="hidden lg:block">
      <div className="sticky top-24 flex flex-col gap-3">
        <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold px-1">
          Your journey
        </div>

        <RailItem
          state={phaseState(phase1Done, step === "phase1")}
          n={1}
          label={p1?.title || "First attempt"}
          ai="AI off"
          preview={phase1Done ? [known, confused, tried].filter(Boolean).join(" · ") : undefined}
        />
        <RailItem
          state={phaseState(phase2Done, step === "phase2")}
          n={2}
          label={p2?.title || "Talk to AI"}
          ai="Bounded AI"
          preview={
            phase2Done
              ? chat.length === 0
                ? "No AI rounds"
                : `${exchangesUsed} round${exchangesUsed === 1 ? "" : "s"} · ${chat.find((t) => t.role === "user")?.content.slice(0, 60) ?? ""}…`
              : undefined
          }
        />
        <RailItem
          state={phaseState(phase3Done, step === "phase3")}
          n={3}
          label={p3?.title || "Reflect"}
          ai="Your voice"
          preview={
            phase3Done
              ? [reflection1, reflection2, reflection3].filter(Boolean).join(" · ")
              : undefined
          }
        />
        <RailItem
          state={step === "submit" ? "active" : "idle"}
          n={4}
          label="Submit"
          ai=""
        />

      </div>
    </aside>
  );
}

function RailItem({
  state,
  n,
  label,
  ai,
  preview,
}: {
  state: "done" | "active" | "idle";
  n: number;
  label: string;
  ai: string;
  preview?: string;
}) {
  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        state === "active"
          ? "border-accent bg-accent-soft/50 shadow-sm"
          : state === "done"
            ? "border-border bg-surface"
            : "border-border bg-surface/50 opacity-60"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold border ${
            state === "done"
              ? "bg-accent border-accent text-white"
              : state === "active"
                ? "bg-white border-accent text-accent-ink"
                : "bg-subtle border-border text-muted"
          }`}
        >
          {state === "done" ? "✓" : n}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{label}</div>
          {ai && <div className="text-[10px] uppercase tracking-wider text-muted">{ai}</div>}
        </div>
      </div>
      {preview && (
        <div className="mt-2 text-xs text-muted leading-snug line-clamp-2 border-t border-border/50 pt-2">
          {preview}
        </div>
      )}
    </div>
  );
}

// ---------- Shared ----------

function StickyActionBar({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-background/85 backdrop-blur-sm border-t border-border flex items-center justify-between gap-4 pt-3">
      {left}
      {right}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
    />
  );
}
