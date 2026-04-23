import { NextRequest } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import { SEMESTER_SYSTEM_PROMPT } from "@/lib/prompts/semester";
import type { SemesterPlan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 90;

const RequestSchema = z.object({
  course_title: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  grade_level: z.string().min(1).max(100),
  total_weeks: z.number().int().min(4).max(52),
  units_outline: z.string().min(1).max(5000),
});

function buildUserMessage(input: z.infer<typeof RequestSchema>): string {
  return [
    `Course title: ${input.course_title}`,
    `Subject: ${input.subject}`,
    `Grade level: ${input.grade_level}`,
    `Total weeks: ${input.total_weeks}`,
    "",
    "Units outline provided by the teacher:",
    input.units_outline,
    "",
    "Return only valid JSON in the shape described in the system prompt.",
  ].join("\n");
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
    const plan = await callLLM<SemesterPlan>({
      system: SEMESTER_SYSTEM_PROMPT,
      user: buildUserMessage(parsed.data),
      json: true,
    });
    return Response.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM error";
    return Response.json({ error: message }, { status: 502 });
  }
}
