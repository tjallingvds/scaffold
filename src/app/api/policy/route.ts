import { NextRequest } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import { POLICY_SYSTEM_PROMPT } from "@/lib/prompts/policy";
import { POLICY_TEMPLATES } from "@/lib/templates/policies";
import type { PolicyDocument } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  template: z.enum(["scaffold_only", "three_phase", "assignment_specific"]),
  subject: z.string().min(1).max(200),
  grade_level: z.string().min(1).max(100),
  course_title: z.string().min(1).max(200),
  key_learning_outcomes: z.string().min(1).max(2000),
  assessment_types: z.string().max(1000).optional(),
});

function buildUserMessage(input: z.infer<typeof RequestSchema>): string {
  const base = POLICY_TEMPLATES.find((t) => t.id === input.template)!;
  const lines = [
    `Adapt the "${base.name}" policy template to this specific course.`,
    "",
    `Course title: ${input.course_title}`,
    `Subject: ${input.subject}`,
    `Grade level: ${input.grade_level}`,
    `Key learning outcomes: ${input.key_learning_outcomes}`,
  ];
  if (input.assessment_types?.trim()) {
    lines.push(`Assessment types in this course: ${input.assessment_types.trim()}`);
  }
  lines.push("", "Base statement to adapt (rewrite in the teacher's voice, calibrated to the course):");
  lines.push(base.base_statement);
  lines.push("", "Return only valid JSON in the shape described in the system prompt.");
  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const doc = await callLLM<PolicyDocument>({
      system: POLICY_SYSTEM_PROMPT,
      user: buildUserMessage(parsed.data),
      json: true,
    });
    return Response.json({ doc });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM error";
    return Response.json({ error: message }, { status: 502 });
  }
}
