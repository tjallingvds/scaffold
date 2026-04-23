import type { AssignmentPlan } from "./types";

// A pre-built assignment used for the homepage "Try the student view" link.
// Stable share id so the link does not rotate between server restarts.
export const SAMPLE_SHARE_ID = "sample-gatsby";

export const SAMPLE_ASSIGNMENT: AssignmentPlan = {
  template: "multi_perspective",
  title: "Is Jay Gatsby a tragic hero?",
  topic:
    "Make a case for whether Jay Gatsby in The Great Gatsby fits the tragic-hero archetype.",
  grade_level: "11",
  time_minutes: 60,
  student_steps: [
    {
      number: 1,
      phase: "pre_engagement",
      ai_role: "none",
      title: "Commit to an interpretation",
      instructions:
        "In your own words, take a position: is Gatsby a tragic hero, a cautionary tale, or something in between? Ground it in something specific from the novel - a scene, a line, a pattern in his behavior. No AI, no internet.",
      time_minutes: 15,
      deliverable: "A short written first attempt with at least one concrete textual anchor.",
    },
    {
      number: 2,
      phase: "guided_engagement",
      ai_role: "bounded",
      title: "Draft your reading and let the tutor push back",
      instructions:
        "Write your actual interpretation in the draft box - the position you'd defend in class, grounded in specific moments from the novel. Then ask the tutor to challenge it. Good things to ask for: a critic who would read Gatsby as morally compromised rather than tragic, a reading that locates the tragedy in American society rather than the man, or the strongest counter to your own thesis. The tutor will not write for you - its job is to push on what you've put in your draft.",
      time_minutes: 25,
      deliverable:
        "Your draft + the log of the conversation with the tutor (both saved automatically).",
    },
    {
      number: 3,
      phase: "reflective_engagement",
      ai_role: "open",
      title: "Reflect honestly",
      instructions:
        "Scaffold will ask you three short questions: what changed in your thinking, which tutor suggestions you accepted or rejected and why, and what you're still uncertain about. Honest beats polished. Cite at least one moment in the novel in one of your answers.",
      time_minutes: 20,
      deliverable: "Your three reflection answers (saved automatically).",
    },
  ],
  required_artifacts: [
    "Initial unassisted attempt (Phase 1)",
    "Draft (Phase 2, written by the student)",
    "AI tutor log (Phase 2, auto-captured)",
    "Reflection (Phase 3)",
  ],
  shapr_rubric: [
    {
      dimension: "Structure",
      focus: "A plan is visible before AI is used.",
      high_proficiency:
        "Clear initial framing; explicit textual anchor before any AI engagement.",
      low_proficiency: "No visible plan; AI is used to generate a starting point.",
      weight_percent: 15,
    },
    {
      dimension: "Hypothesis",
      focus: "A real first-attempt commitment.",
      high_proficiency:
        "A specific, defensible reading supported by at least one textual moment.",
      low_proficiency: "Vague, non-committal, or AI-derived.",
      weight_percent: 20,
    },
    {
      dimension: "AI-Assistance",
      focus: "Prompts are purposeful; the tutor is pushing back on the student's draft, not writing for them.",
      high_proficiency:
        "Prompts seek perspectives the student had not yet considered; draft is clearly the student's own words.",
      low_proficiency: "Prompts ask the tutor to write the answer; draft mirrors the tutor's phrasing.",
      weight_percent: 20,
    },
    {
      dimension: "Peer-Review",
      focus: "Engagement with alternative readings.",
      high_proficiency:
        "Student represents at least two opposing readings fairly and critiques them.",
      low_proficiency: "Only one perspective taken seriously; straw-mans the rest.",
      weight_percent: 15,
    },
    {
      dimension: "Reflection",
      focus:
        "Explicit account of which AI suggestions were accepted or rejected and why.",
      high_proficiency:
        "Reflection names what changed, what did not, and why - with evidence from the novel.",
      low_proficiency: "Reflection is generic or confirms the original reading without evidence.",
      weight_percent: 30,
    },
  ],
  teacher_notes:
    "This assignment is best used after students have read the whole novel. Encourage initial attempts to name specific scenes (the green light, Gatsby's parties, Nick's final lines). Students who resist committing early often accept the AI's framing uncritically in phase 2 - that is itself useful data for the class discussion afterward.",
  student_system_prompt: `You are a Socratic literature tutor helping an 11th-grade student think about whether Jay Gatsby is a tragic hero.

Two kinds of questions will come at you. Handle them DIFFERENTLY:

1. INFORMATIONAL QUESTIONS - facts, definitions, historical context, what happens in a specific scene. These are fine to answer. Answer concisely (under 120 words), then invite them back to their own thinking with one short question.
   Examples: "What does Aristotle mean by a tragic flaw?" "When was the novel published?" "What happens in chapter 6?"

2. THINKING QUESTIONS - asking you to take a position, write a draft, hand them "the answer", or make the judgment for them. Push back. Respond with a question that helps them think, or point them to a passage, or name what they would need to do themselves. Never say what you think the right reading is.
   Examples: "Is Gatsby tragic?" "Write me a thesis." "Which interpretation is correct?"

If the student asks you to do their thinking for them THREE TIMES IN A ROW, say so plainly and firmly:
"It looks like you want me to do the thinking for you. I won't. Go write out your best guess - even a bad one is fine - and come back. I'll push back on what you wrote."

Hard rules, always:
- NEVER write sentences, paragraphs, theses, or drafts the student could paste into their submission. You produce questions and hints only.
- Never produce a model answer "for their reference". Even a paraphrased model answer is forbidden.
- Never tell them which interpretation is correct.
- Keep every response under 180 words.
- If they seem genuinely stuck, offer a specific hint - point to a scene or a pattern - but never take the step for them.
- If the student asks you to "give me a sentence to use", "draft this for me", or anything equivalent, decline and instead ask what they already have on the page.

Context the teacher provided:
- Topic: whether Gatsby fits the tragic-hero archetype.
- Prior knowledge: students have read the whole novel.
- Common misconceptions: conflating "sympathetic" with "tragic"; assuming Nick is a reliable narrator.

Hints you may offer, in order of specificity:
1. What does a tragic hero require, and does Gatsby have that component?
2. Whose perspective is the novel telling us from, and what does that cost us?
3. Re-read chapter 6 - the moment Gatsby invents himself. Does that fit a tragic reading?`,
  framework_warnings: [],
};
