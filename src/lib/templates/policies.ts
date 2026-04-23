import type { PolicyTemplateId } from "@/lib/types";

export interface PolicyTemplateMeta {
  id: PolicyTemplateId;
  name: string;
  best_for: string;
  base_statement: string;
}

export const POLICY_TEMPLATES: PolicyTemplateMeta[] = [
  {
    id: "scaffold_only",
    name: "Scaffold-Only",
    best_for: "Foundational skill courses where AI stays off the critical path but on during revision.",
    base_statement: `In this course we distinguish between AI as a scaffold (permitted) and AI as a substitute (not permitted). You may use AI tools to generate alternative explanations of concepts you have already attempted, to translate dense readings into more accessible language, to produce practice problems, and to critique a draft you have written yourself. You may not use AI to generate original writing, solutions to assigned problems, or final submissions of any kind. Every AI-involved assignment requires an AI-use note describing what you used AI for and when.`,
  },
  {
    id: "three_phase",
    name: "Three-Phase",
    best_for: "Writing-intensive or discussion-intensive courses running the full cycle.",
    base_statement: `AI use in this course is structured around three phases per major assignment. Phase 1 (Pre-Engagement) is AI-off: you produce an initial attempt using only your own knowledge. Phase 2 (Guided Engagement) is AI-bounded: you use a specific prompt template provided in class and compare the AI output to your own work. Phase 3 (Reflective Engagement) is AI-open: you use AI to stress-test and refine your thinking, then submit a reflection describing what changed and why. Final submissions must include artifacts from all three phases.`,
  },
  {
    id: "assignment_specific",
    name: "Assignment-Specific",
    best_for: "Courses where AI appropriateness varies widely.",
    base_statement: `This course includes three types of assessment with different AI policies. Type 1 (examinations, in-class work, timed responses) is AI-prohibited. Type 2 (take-home projects, essays, problem sets) permits AI as a scaffold: you may use it to generate examples, critique drafts, or explore alternative approaches, but not to generate original content for submission. Type 3 (extended research, creative projects) requires AI use: you must document how AI shaped your thinking and evaluate its contribution critically.`,
  },
];
