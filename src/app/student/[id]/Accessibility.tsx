"use client";

import { useEffect, useState } from "react";

export type ProfileId =
  | "adhd"
  | "autism"
  | "dyslexia"
  | "ell_intermediate"
  | "executive_function"
  | "sensory_sensitivity"
  | "reading_level_low"
  | "reading_level_high";

export interface AccessibilityPrefs {
  text_size: "default" | "large" | "xlarge";
  dyslexia_friendly: boolean;
  reduce_motion: boolean;
  high_contrast: boolean;
  line_spacing: "default" | "relaxed" | "loose";
  focus_mode: boolean;
  chunked_text: boolean;
  show_timer: boolean;
  // Which named profile the student last picked. Drives how the AI tutor talks
  // to them (tone, sentence length, language complexity). Null = no special
  // adaptation.
  profile: ProfileId | null;
}

// Additional instructions appended to the tutor's system prompt based on the
// student's chosen profile. These shape WHAT the tutor says, not just UI.
export const TUTOR_ADAPTATIONS: Record<ProfileId, string> = {
  adhd:
    "STUDENT CONTEXT: The student has ADHD. Keep every response under 80 words. Use at most one question per turn. Put the most important point first. Use bullet points when listing anything. Avoid run-on sentences.",
  autism:
    "STUDENT CONTEXT: The student is autistic. Be explicit and literal. State exactly what you are asking them to do. Avoid sarcasm, rhetorical questions, and figurative language (or define any figurative term you use). Do not assume they will infer implied meanings. When you ask a question, state clearly what kind of answer you expect.",
  dyslexia:
    "STUDENT CONTEXT: The student has dyslexia. Write short sentences (aim for under 15 words each). Use simple, concrete vocabulary. Avoid long paragraphs — break ideas into separate short lines. Do not use unusual spelling or jargon without defining it.",
  ell_intermediate:
    "STUDENT CONTEXT: The student is an English Language Learner at an intermediate level. Write at approximately a grade-6 English reading level. Keep sentences short and use active voice. Define any academic term the first time you use it (briefly, in parentheses). Avoid idioms unless you explain them.",
  executive_function:
    "STUDENT CONTEXT: The student benefits from executive-function support. End every response with one clear, concrete next step — not an open-ended 'think about this.' Structure the response as (1) reaction to what they wrote, (2) the specific next action. Avoid offering multiple options at once.",
  sensory_sensitivity:
    "STUDENT CONTEXT: The student has sensory sensitivity. Keep language calm and matter-of-fact. Avoid exclamation marks, ALL CAPS, emphatic language, or cheerleading. Short, steady sentences. No surprises in tone.",
  reading_level_low:
    "STUDENT CONTEXT: The student benefits from a lower reading level. Use short sentences and everyday vocabulary. Define any academic term the first time it appears. Avoid complex sentence structures.",
  reading_level_high:
    "STUDENT CONTEXT: The student is an advanced reader. You can use precise, academic vocabulary and richer syntax where it helps the argument. Do not dumb anything down.",
};

const DEFAULTS: AccessibilityPrefs = {
  text_size: "default",
  dyslexia_friendly: false,
  reduce_motion: false,
  high_contrast: false,
  line_spacing: "default",
  focus_mode: false,
  chunked_text: false,
  show_timer: false,
  profile: null,
};

// Same profile set teachers pick from in the Differentiation Studio,
// translated into the student-side UI adaptations each profile benefits from.
export interface ProfilePreset {
  id: string;
  label: string;
  blurb: string;
  apply: Partial<AccessibilityPrefs>;
}

export const PROFILE_PRESETS: ProfilePreset[] = [
  {
    id: "adhd",
    label: "ADHD",
    blurb: "Focus mode, chunked text, visible timer",
    apply: { focus_mode: true, chunked_text: true, show_timer: true },
  },
  {
    id: "autism",
    label: "Autism",
    blurb: "Focus mode, reduced motion, high contrast",
    apply: {
      focus_mode: true,
      reduce_motion: true,
      high_contrast: true,
    },
  },
  {
    id: "dyslexia",
    label: "Dyslexia",
    blurb: "Dyslexia font, larger text, relaxed line spacing",
    apply: {
      dyslexia_friendly: true,
      text_size: "large",
      line_spacing: "relaxed",
    },
  },
  {
    id: "ell_intermediate",
    label: "ELL · intermediate",
    blurb: "Larger text, relaxed spacing, chunked text",
    apply: {
      text_size: "large",
      line_spacing: "relaxed",
      chunked_text: true,
    },
  },
  {
    id: "executive_function",
    label: "Executive function",
    blurb: "Visible timer, chunked text, focus mode",
    apply: { show_timer: true, chunked_text: true, focus_mode: true },
  },
  {
    id: "sensory_sensitivity",
    label: "Sensory sensitivity",
    blurb: "Reduced motion, chunked text, focus mode",
    apply: { reduce_motion: true, chunked_text: true, focus_mode: true },
  },
  {
    id: "reading_level_low",
    label: "Lower reading level",
    blurb: "Larger text, looser line spacing, chunked",
    apply: {
      text_size: "large",
      line_spacing: "loose",
      chunked_text: true,
    },
  },
  {
    id: "reading_level_high",
    label: "Higher reading level",
    blurb: "Default layout; dense comfortable",
    apply: {},
  },
];

const STORAGE_KEY = "scaffold.a11y.v1";

function readStoredPrefs(): AccessibilityPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

const ALL_A11Y_CLASSES = [
  "a11y-text-large",
  "a11y-text-xlarge",
  "a11y-dyslexia",
  "a11y-no-motion",
  "a11y-contrast",
  "a11y-line-relaxed",
  "a11y-line-loose",
  "a11y-focus",
  "a11y-chunked",
];

export function useAccessibility() {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredPrefs();
    if (JSON.stringify(stored) !== JSON.stringify(DEFAULTS)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrefs(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs, hydrated]);

  // Apply classes to <html> so Tailwind's rem-based sizes actually scale.
  // Cleanup on unmount so other pages (teacher side) aren't affected.
  useEffect(() => {
    const root = document.documentElement;
    const classes = a11yClass(prefs).split(" ").filter(Boolean);
    // Clear any previous scaffold a11y classes first, add current ones.
    root.classList.remove(...ALL_A11Y_CLASSES);
    root.classList.add(...classes);
    return () => {
      root.classList.remove(...ALL_A11Y_CLASSES);
    };
  }, [prefs]);

  return { prefs, setPrefs };
}

export function a11yClass(prefs: AccessibilityPrefs): string {
  const classes: string[] = [];
  if (prefs.text_size === "large") classes.push("a11y-text-large");
  if (prefs.text_size === "xlarge") classes.push("a11y-text-xlarge");
  if (prefs.dyslexia_friendly) classes.push("a11y-dyslexia");
  if (prefs.reduce_motion) classes.push("a11y-no-motion");
  if (prefs.high_contrast) classes.push("a11y-contrast");
  if (prefs.line_spacing === "relaxed") classes.push("a11y-line-relaxed");
  if (prefs.line_spacing === "loose") classes.push("a11y-line-loose");
  if (prefs.focus_mode) classes.push("a11y-focus");
  if (prefs.chunked_text) classes.push("a11y-chunked");
  return classes.join(" ");
}

export function AccessibilityMenu({
  prefs,
  setPrefs,
}: {
  prefs: AccessibilityPrefs;
  setPrefs: (p: AccessibilityPrefs) => void;
}) {
  const [open, setOpen] = useState(false);
  const anyOn =
    prefs.text_size !== "default" ||
    prefs.dyslexia_friendly ||
    prefs.reduce_motion ||
    prefs.high_contrast ||
    prefs.line_spacing !== "default" ||
    prefs.focus_mode ||
    prefs.chunked_text ||
    prefs.show_timer;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-chrome-soft text-chrome-ink hover:bg-chrome-soft/80 px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Accessibility settings"
      >
        <span aria-hidden>♿</span>
        <span className="hidden sm:inline">Accessibility</span>
        {anyOn && (
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-accent"
            title="Preferences on"
          />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Accessibility settings"
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-surface border border-border shadow-xl p-4 z-50 flex flex-col gap-3"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Make this easier for you
              </h2>
              {anyOn && (
                <button
                  type="button"
                  onClick={() => setPrefs(DEFAULTS)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>

            <SectionLabel>Quick setup</SectionLabel>
            <p className="text-xs text-muted -mt-1 leading-relaxed">
              Pick one that fits you. You can fine-tune after.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PROFILE_PRESETS.map((p) => {
                const active = prefs.profile === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setPrefs({
                        ...DEFAULTS,
                        ...p.apply,
                        profile: p.id as ProfileId,
                      })
                    }
                    title={p.blurb}
                    className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                      active
                        ? "bg-foreground text-surface border-foreground"
                        : "border-border bg-surface text-foreground hover:border-foreground hover:bg-subtle"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <SectionLabel>Custom</SectionLabel>
            <Row label="Text size">
              <Segmented
                value={prefs.text_size}
                options={[
                  { value: "default", label: "A" },
                  { value: "large", label: "A+" },
                  { value: "xlarge", label: "A++" },
                ]}
                onChange={(v) =>
                  setPrefs({ ...prefs, text_size: v as AccessibilityPrefs["text_size"] })
                }
              />
            </Row>

            <Row label="Line spacing">
              <Segmented
                value={prefs.line_spacing}
                options={[
                  { value: "default", label: "Normal" },
                  { value: "relaxed", label: "Relaxed" },
                  { value: "loose", label: "Loose" },
                ]}
                onChange={(v) =>
                  setPrefs({
                    ...prefs,
                    line_spacing: v as AccessibilityPrefs["line_spacing"],
                  })
                }
              />
            </Row>

            <SectionLabel>Visual</SectionLabel>
            <Toggle
              label="Dyslexia-friendly"
              hint="Wider letter spacing, friendlier font"
              checked={prefs.dyslexia_friendly}
              onChange={(v) => setPrefs({ ...prefs, dyslexia_friendly: v })}
            />
            <Toggle
              label="Higher contrast"
              hint="Stronger borders, darker text"
              checked={prefs.high_contrast}
              onChange={(v) => setPrefs({ ...prefs, high_contrast: v })}
            />

            <SectionLabel>Focus &amp; pacing</SectionLabel>
            <Toggle
              label="Focus mode"
              hint="Hides the side panel so only the current task is visible"
              checked={prefs.focus_mode}
              onChange={(v) => setPrefs({ ...prefs, focus_mode: v })}
            />
            <Toggle
              label="Chunk long text"
              hint="Breaks paragraphs into bite-sized blocks"
              checked={prefs.chunked_text}
              onChange={(v) => setPrefs({ ...prefs, chunked_text: v })}
            />
            <Toggle
              label="Show timer"
              hint="A soft countdown for the current phase"
              checked={prefs.show_timer}
              onChange={(v) => setPrefs({ ...prefs, show_timer: v })}
            />
            <Toggle
              label="Reduce motion"
              hint="Disable transitions and bouncing indicators"
              checked={prefs.reduce_motion}
              onChange={(v) => setPrefs({ ...prefs, reduce_motion: v })}
            />

            <p className="text-xs text-muted leading-relaxed border-t border-border pt-3 mt-1">
              Saved to this device only. Your teacher won&rsquo;t see your
              settings.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.12em] text-muted font-semibold pt-1">
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-subtle p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            value === o.value
              ? "bg-foreground text-surface"
              : "text-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted mt-0.5">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 flex-shrink-0 rounded-full border transition-colors ${
          checked
            ? "bg-foreground border-foreground"
            : "bg-subtle border-border"
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-surface transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
