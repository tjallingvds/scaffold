import type { AssignmentTemplate } from "@/lib/types";

export interface AssignmentExample {
  id: string;
  label: string;
  short: string;
  subject: string;
  grade_level: string;
  template: AssignmentTemplate;
  topic: string;
  time_minutes: number;
  special_considerations?: string;
}

// Realistic, classroom-ready starting points.
export const ASSIGNMENT_EXAMPLES: AssignmentExample[] = [
  {
    id: "gatsby",
    label: "English 11 · Gatsby's tragic flaw",
    short: "Gatsby's tragic flaw",
    subject: "11th-grade English",
    grade_level: "11",
    template: "multi_perspective",
    topic:
      "Make a case for whether Jay Gatsby in The Great Gatsby fits the tragic-hero archetype.",
    time_minutes: 60,
  },
  {
    id: "giraffes",
    label: "Biology 9 · Why giraffes have long necks",
    short: "Why giraffes have long necks",
    subject: "9th-grade biology",
    grade_level: "9",
    template: "compare_critique",
    topic:
      "Explain why giraffes have long necks. Then compare your explanation with a common misconception (Lamarckian inheritance) and decide which is correct.",
    time_minutes: 45,
    special_considerations: "Two students with ADHD; one ELL at intermediate level.",
  },
  {
    id: "titration",
    label: "Chemistry 10 · Lab-report revision",
    short: "Lab-report revision",
    subject: "10th-grade chemistry",
    grade_level: "10",
    template: "ai_feedback",
    topic:
      "Students revise a titration lab report. AI gives critique only (no rewriting); students choose which feedback to take and justify why.",
    time_minutes: 50,
  },
  {
    id: "break-ai-autism",
    label: "AI literacy · Break the AI on a biased topic",
    short: "Break the AI",
    subject: "High school electives / AI literacy",
    grade_level: "10–12",
    template: "break_ai",
    topic:
      "Find a specific instance where ChatGPT oversimplifies or misrepresents autism. Document the prompt, the error, and why it matters.",
    time_minutes: 45,
  },
  {
    id: "reconstruction",
    label: "US History 11 · Research on Reconstruction",
    short: "Research on Reconstruction",
    subject: "11th-grade US History",
    grade_level: "11",
    template: "scaffolded_exploration",
    topic:
      "Each student picks a narrow question about Reconstruction (1865–1877). AI may help map the terrain; research and original writing are the student's.",
    time_minutes: 90,
  },
];
