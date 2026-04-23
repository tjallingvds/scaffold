import type { AssignmentTemplate } from "@/lib/types";

export interface AssignmentTemplateMeta {
  id: AssignmentTemplate;
  name: string;
  best_for: string;
  short_description: string;
  default_minutes: number;
}

export const ASSIGNMENT_TEMPLATES: AssignmentTemplateMeta[] = [
  {
    id: "compare_critique",
    name: "Compare & Critique",
    best_for: "Short essays, position questions, open-ended problems",
    short_description:
      "Students write their own answer, then compare with AI's answer, then write a final position.",
    default_minutes: 50,
  },
  {
    id: "ai_feedback",
    name: "AI as Feedback Tool",
    best_for: "Writing, lab reports, any work that improves through revision",
    short_description:
      "Students draft independently, AI critiques (no rewriting), students revise and justify which feedback they accepted.",
    default_minutes: 60,
  },
  {
    id: "multi_perspective",
    name: "Multi-Perspective Analysis",
    best_for: "History, literature, social studies, ethics, contested interpretations",
    short_description:
      "Students commit to an interpretation, use AI to generate alternatives, write a synthesis.",
    default_minutes: 60,
  },
  {
    id: "break_ai",
    name: "Break the AI",
    best_for: "AI literacy, critical evaluation, bias",
    short_description:
      "Students deliberately probe AI to surface errors or biases, and report what they found and why it matters.",
    default_minutes: 45,
  },
  {
    id: "scaffolded_exploration",
    name: "Scaffolded Exploration",
    best_for: "Research projects, inquiry units, student-directed learning",
    short_description:
      "Students own the research question; AI maps terrain only. Submissions include an AI-use log.",
    default_minutes: 90,
  },
];
