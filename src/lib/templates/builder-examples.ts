// Starting-point presets for builders other than Assignment (which has its
// own richer example set in assignment-examples.ts).

export interface LessonExample {
  id: string;
  label: string;
  subject: string;
  grade_level: string;
  concept: string;
  learning_objective: string;
  time_minutes: number;
  scope:
    | "full_cycle"
    | "pre_engagement"
    | "guided_engagement"
    | "reflective_engagement";
  special_considerations?: string;
}

export const LESSON_EXAMPLES: LessonExample[] = [
  {
    id: "biology-natural-selection",
    label: "Biology 10 · Natural selection",
    subject: "10th-grade biology",
    grade_level: "10",
    concept: "Natural selection",
    learning_objective:
      "Students can explain how allele frequencies shift in a population under selection pressure.",
    time_minutes: 75,
    scope: "full_cycle",
    special_considerations: "Two students with ADHD; one ELL at intermediate level.",
  },
  {
    id: "english-reliable-narrator",
    label: "English 11 · Reliable narrators",
    subject: "11th-grade English",
    grade_level: "11",
    concept: "Reliable vs unreliable narrators",
    learning_objective:
      "Students can identify textual evidence that signals an unreliable narrator and explain its effect on meaning.",
    time_minutes: 60,
    scope: "full_cycle",
  },
  {
    id: "history-reconstruction",
    label: "US History 11 · Reconstruction framing",
    subject: "11th-grade US History",
    grade_level: "11",
    concept: "Whose story Reconstruction tells",
    learning_objective:
      "Students can compare two contemporaneous accounts of Reconstruction and argue whose perspective is being centered in each.",
    time_minutes: 75,
    scope: "full_cycle",
  },
];

export interface DifferentiationExample {
  id: string;
  label: string;
  source_text: string;
  profiles: (
    | "reading_level_low"
    | "reading_level_high"
    | "adhd"
    | "autism"
    | "dyslexia"
    | "ell_intermediate"
    | "executive_function"
    | "sensory_sensitivity"
    | "cultural_context"
  )[];
  cultural_context?: string;
}

export const DIFFERENTIATION_EXAMPLES: DifferentiationExample[] = [
  {
    id: "photosynthesis",
    label: "Photosynthesis · ADHD + ELL",
    source_text:
      "Photosynthesis is the process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water. It generally involves the green pigment chlorophyll and generates oxygen as a by-product.",
    profiles: ["adhd", "ell_intermediate"],
  },
  {
    id: "constitution-preamble",
    label: "Constitution preamble · Dyslexia + lower reading level",
    source_text:
      "We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.",
    profiles: ["dyslexia", "reading_level_low"],
  },
  {
    id: "cell-division",
    label: "Cell division · Autism + executive function",
    source_text:
      "Mitosis is a type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus. It proceeds through four stages: prophase, metaphase, anaphase, and telophase.",
    profiles: ["autism", "executive_function"],
  },
];

export interface PolicyExample {
  id: string;
  label: string;
  template: "scaffold_only" | "three_phase" | "assignment_specific";
  course_title: string;
  subject: string;
  grade_level: string;
  key_learning_outcomes: string;
  assessment_types?: string;
}

export const POLICY_EXAMPLES: PolicyExample[] = [
  {
    id: "english-lit",
    label: "English 11 · Three-phase policy",
    template: "three_phase",
    course_title: "English 11 - American Literature",
    subject: "English / Literature",
    grade_level: "11",
    key_learning_outcomes:
      "Close reading of American novels, argumentative writing with textual evidence, presentation of an independent literary analysis.",
    assessment_types:
      "Two major essays, a midterm close-reading exam, a final research project.",
  },
  {
    id: "math-foundations",
    label: "Algebra · Scaffold-only policy",
    template: "scaffold_only",
    course_title: "Algebra I",
    subject: "Mathematics",
    grade_level: "9",
    key_learning_outcomes:
      "Fluency with linear equations, systems of equations, and quadratic reasoning. Argumentation with mathematical evidence.",
    assessment_types: "Weekly problem sets, two unit tests, a final exam.",
  },
  {
    id: "research-seminar",
    label: "Research seminar · Assignment-specific policy",
    template: "assignment_specific",
    course_title: "Junior Research Seminar",
    subject: "Interdisciplinary",
    grade_level: "11",
    key_learning_outcomes:
      "Formulate a defensible research question, gather and evaluate sources, produce an original 15-page paper.",
    assessment_types:
      "In-class timed writings (Type 1), scaffolded drafts (Type 2), the final research paper (Type 3).",
  },
];

export interface SemesterExample {
  id: string;
  label: string;
  course_title: string;
  subject: string;
  grade_level: string;
  total_weeks: number;
  units_outline: string;
}

export const SEMESTER_EXAMPLES: SemesterExample[] = [
  {
    id: "ap-us-history",
    label: "AP US History · 16 weeks",
    course_title: "AP US History",
    subject: "History",
    grade_level: "11",
    total_weeks: 16,
    units_outline: [
      "Unit 1: Colonial foundations to 1763",
      "Unit 2: Revolution and Constitution",
      "Unit 3: Jacksonian democracy",
      "Unit 4: Slavery, sectionalism, and Civil War",
      "Unit 5: Reconstruction and the Gilded Age",
    ].join("\n"),
  },
  {
    id: "biology-10",
    label: "Biology 10 · 12 weeks",
    course_title: "Biology 10",
    subject: "Biology",
    grade_level: "10",
    total_weeks: 12,
    units_outline: [
      "Unit 1: Cell structure and function",
      "Unit 2: DNA, genes, inheritance",
      "Unit 3: Evolution and natural selection",
      "Unit 4: Ecology and ecosystems",
    ].join("\n"),
  },
  {
    id: "english-11-american-lit",
    label: "English 11 · American Literature",
    course_title: "English 11 - American Literature",
    subject: "English / Literature",
    grade_level: "11",
    total_weeks: 16,
    units_outline: [
      "Unit 1: Early American voices (Puritans to Revolution)",
      "Unit 2: Romanticism and Transcendentalism",
      "Unit 3: Realism and Naturalism",
      "Unit 4: Modernism (Fitzgerald, Hemingway, Hurston)",
      "Unit 5: Contemporary American fiction",
    ].join("\n"),
  },
];
