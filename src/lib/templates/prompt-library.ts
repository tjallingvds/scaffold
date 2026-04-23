export type PromptCategory =
  | "representation"
  | "engagement"
  | "action_expression"
  | "pre_engagement"
  | "reflection";

export interface PromptTemplate {
  id: string;
  category: PromptCategory;
  name: string;
  description: string;
  template: string;
  variables: { key: string; label: string; placeholder: string }[];
}

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: "multi_format_explanation",
    category: "representation",
    name: "Multi-format explanation",
    description:
      "Produce four parallel explanations of one concept: simple language, real-world analogy, step-by-step, visual description.",
    template: `Explain [CONCEPT] for a [GRADE_LEVEL] student in four ways:
1. Simple language (8th-grade reading level max, short sentences).
2. A real-world analogy using something a teenager would know.
3. A step-by-step breakdown (numbered list, max 7 steps).
4. A visual description (describe what a diagram would show, suitable for a student who will then draw it).`,
    variables: [
      { key: "CONCEPT", label: "Concept", placeholder: "e.g. photosynthesis" },
      { key: "GRADE_LEVEL", label: "Grade level", placeholder: "e.g. 8th grade" },
    ],
  },
  {
    id: "reading_level_adaptation",
    category: "representation",
    name: "Reading-level adaptation",
    description: "Rewrite text at a target reading level while preserving all key ideas.",
    template: `Rewrite the following text for a student reading at [LEVEL]. Preserve all key ideas. Use shorter sentences and simpler vocabulary. Break long paragraphs into shorter ones. Do not simplify the content; only the language.

[TEXT]`,
    variables: [
      { key: "LEVEL", label: "Target reading level", placeholder: "e.g. grade 6" },
      { key: "TEXT", label: "Source text", placeholder: "Paste the text here…" },
    ],
  },
  {
    id: "multimodal_translation",
    category: "representation",
    name: "Multimodal translation",
    description:
      "One text, three output formats: audio-friendly, bulleted for ADHD, and concept-map.",
    template: `Take this text and produce: a one-paragraph audio-friendly version; a bullet-point outline for a student with ADHD who processes better with visual chunking; a concept-map description (5 main concepts and how they connect).

[TEXT]`,
    variables: [{ key: "TEXT", label: "Source text", placeholder: "Paste the text here…" }],
  },
  {
    id: "interest_framing",
    category: "engagement",
    name: "Interest-based framing",
    description: "Connect a concept to two specific student interests without compromising rigor.",
    template: `A [GRADE_LEVEL] student whose interests include [INTEREST_A] and [INTEREST_B] is learning about [CONCEPT]. Write a one-page introduction that connects the concept to those interests. Keep the content accurate; the goal is relevance, not dumbing down.`,
    variables: [
      { key: "GRADE_LEVEL", label: "Grade level", placeholder: "e.g. 10th grade" },
      { key: "INTEREST_A", label: "Interest A", placeholder: "e.g. basketball" },
      { key: "INTEREST_B", label: "Interest B", placeholder: "e.g. music production" },
      { key: "CONCEPT", label: "Concept", placeholder: "e.g. exponential decay" },
    ],
  },
  {
    id: "culturally_responsive",
    category: "engagement",
    name: "Culturally responsive examples",
    description:
      "Three worked examples of the same concept set in three different cultural or geographic contexts.",
    template: `I'm teaching [CONCEPT] to students from diverse backgrounds. Generate three worked examples, each set in a different cultural or geographic context. The math/science/history should be identical across the three; the context should vary. Avoid stereotype.`,
    variables: [{ key: "CONCEPT", label: "Concept", placeholder: "e.g. proportional reasoning" }],
  },
  {
    id: "alt_assessment_formats",
    category: "action_expression",
    name: "Alternative assessment formats",
    description:
      "Five ways a student could demonstrate mastery: written, oral, visual, performance, project.",
    template: `For the learning objective [OBJECTIVE], suggest five different ways a student could demonstrate mastery: one written, one oral, one visual, one performance-based, one project-based. For each, describe what a strong response would look like.`,
    variables: [
      {
        key: "OBJECTIVE",
        label: "Learning objective",
        placeholder: "e.g. students can argue a position with textual evidence",
      },
    ],
  },
  {
    id: "rubric_for_alt_format",
    category: "action_expression",
    name: "Rubric for an alternative format",
    description: "Generate a rubric for a non-traditional format at the same rigor as a traditional essay.",
    template: `A student in my [SUBJECT] class wants to demonstrate understanding of [OBJECTIVE] by [ALT_FORMAT]. Generate a rubric that assesses content mastery at the same rigor as a traditional essay on the same topic. Focus on subject-matter thinking, not production quality.`,
    variables: [
      { key: "SUBJECT", label: "Subject", placeholder: "e.g. US History" },
      { key: "OBJECTIVE", label: "Objective", placeholder: "e.g. analyze primary sources" },
      { key: "ALT_FORMAT", label: "Alternative format", placeholder: "e.g. a 5-minute podcast" },
    ],
  },
  {
    id: "pre_engagement_activity",
    category: "pre_engagement",
    name: "Pre-engagement opening",
    description:
      "A 10-minute opening activity that elicits prior knowledge and surfaces misconceptions - without AI or internet.",
    template: `I am about to teach [CONCEPT] to [GRADE_LEVEL] students. Generate a 10-minute opening activity that will: elicit what students already think or know; surface common misconceptions; give every student a low-stakes way to commit to an initial idea. The activity should not require AI or internet access.`,
    variables: [
      { key: "CONCEPT", label: "Concept", placeholder: "e.g. Newton's third law" },
      { key: "GRADE_LEVEL", label: "Grade level", placeholder: "e.g. 9th grade" },
    ],
  },
  {
    id: "reflection_questions",
    category: "reflection",
    name: "Reflection questions",
    description: "Five transfer-focused self-check questions for after an assignment.",
    template: `Give me five questions a student could ask themselves after finishing an assignment on [TOPIC], to check whether they actually understood the material or just completed the task. Questions should target transfer (applying the idea in a new context), not recall.`,
    variables: [{ key: "TOPIC", label: "Topic", placeholder: "e.g. supply and demand" }],
  },
];

export const CATEGORY_META: Record<PromptCategory, { label: string; blurb: string }> = {
  representation: {
    label: "Representation",
    blurb: "Multiple means of perceiving content.",
  },
  engagement: {
    label: "Engagement",
    blurb: "Connecting to learner identity and interest.",
  },
  action_expression: {
    label: "Action & Expression",
    blurb: "Multiple means of demonstrating understanding.",
  },
  pre_engagement: {
    label: "Pre-Engagement",
    blurb: "Scaffolding the initial unassisted attempt.",
  },
  reflection: {
    label: "Reflection",
    blurb: "Supporting metacognition.",
  },
};
