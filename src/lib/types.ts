// ---------- Shared ----------
export type Severity = "info" | "warning" | "error";

export interface FrameworkWarning {
  severity: Severity;
  message: string;
}

// ---------- Lesson ----------
export type Phase = "pre_engagement" | "guided_engagement" | "reflective_engagement";
export type AIRole = "none" | "bounded" | "open";

export interface Activity {
  name: string;
  minutes: number;
  description: string;
}

export interface PhaseBlock {
  phase: Phase;
  title: string;
  time_minutes: number;
  ai_role: AIRole;
  activities: Activity[];
  materials: string[];
}

export interface DifferentiationNote {
  profile: string;
  adaptation: string;
}

export interface LessonPlan {
  learning_objective: string;
  phase_breakdown: PhaseBlock[];
  differentiation_notes: DifferentiationNote[];
  assessment_notes: string;
  framework_warnings: FrameworkWarning[];
}

export interface LessonRequest {
  subject: string;
  grade_level: string;
  concept: string;
  learning_objective: string;
  time_minutes: number;
  scope: "pre_engagement" | "guided_engagement" | "reflective_engagement" | "full_cycle";
  special_considerations?: string;
}

// ---------- Assignment ----------
export type AssignmentTemplate =
  | "compare_critique"
  | "ai_feedback"
  | "multi_perspective"
  | "break_ai"
  | "scaffolded_exploration";

export interface AssignmentStep {
  number: number;
  phase: Phase;
  ai_role: AIRole;
  title: string;
  instructions: string;
  time_minutes: number;
  deliverable: string;
}

export interface ShaprRubricRow {
  dimension: string;
  focus: string;
  high_proficiency: string;
  low_proficiency: string;
  weight_percent: number;
}

export interface AssignmentPlan {
  template: AssignmentTemplate;
  title: string;
  topic: string;
  grade_level: string;
  time_minutes: number;
  student_steps: AssignmentStep[];
  required_artifacts: string[];
  shapr_rubric: ShaprRubricRow[];
  teacher_notes: string;
  student_system_prompt: string; // for teachers to paste into ChatGPT/Claude/Gemini
  framework_warnings: FrameworkWarning[];
}

export interface AssignmentRequest {
  template: AssignmentTemplate;
  topic: string;
  subject: string;
  grade_level: string;
  time_minutes: number;
  special_considerations?: string;
}

// ---------- Differentiation ----------
export type LearnerProfile =
  | "reading_level_low"
  | "reading_level_high"
  | "adhd"
  | "autism"
  | "dyslexia"
  | "ell_intermediate"
  | "executive_function"
  | "sensory_sensitivity"
  | "cultural_context";

export interface DifferentiationVariant {
  profile: LearnerProfile;
  profile_label: string;
  transformed_text: string;
  rationale: string;
  changes: string[];
}

export interface DifferentiationResult {
  variants: DifferentiationVariant[];
  source_preserved_check: string; // one-line check that substance is preserved
}

export interface DifferentiationRequest {
  source_text: string;
  profiles: LearnerProfile[];
  cultural_context?: string; // only used when profile includes cultural_context
}

// ---------- Policy ----------
export type PolicyTemplateId = "scaffold_only" | "three_phase" | "assignment_specific";

export interface PolicyDocument {
  template: PolicyTemplateId;
  syllabus_statement: string;
  day_one_discussion_guide: string[];
  student_faq: { question: string; answer: string }[];
}

export interface PolicyRequest {
  template: PolicyTemplateId;
  subject: string;
  grade_level: string;
  course_title: string;
  key_learning_outcomes: string;
  assessment_types?: string;
}

// ---------- Semester Plan ----------
export interface SemesterUnit {
  week_start: number;
  week_end: number;
  unit_title: string;
  learning_objectives: string[];
  recommended_templates: AssignmentTemplate[];
  rationale: string;
}

export interface SemesterPlan {
  course_title: string;
  total_weeks: number;
  units: SemesterUnit[];
  variety_notes: string;
  framework_warnings: FrameworkWarning[];
}

export interface SemesterRequest {
  course_title: string;
  subject: string;
  grade_level: string;
  total_weeks: number;
  units_outline: string; // free-form teacher outline
}
