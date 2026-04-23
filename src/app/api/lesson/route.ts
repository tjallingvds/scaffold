import { NextRequest } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import { LESSON_SYSTEM_PROMPT } from "@/lib/prompts/lesson";
import type { LessonPlan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  subject: z.string().min(1).max(200),
  grade_level: z.string().min(1).max(100),
  concept: z.string().min(1).max(500),
  learning_objective: z.string().min(1).max(1000),
  time_minutes: z.number().int().min(5).max(300),
  scope: z.enum([
    "pre_engagement",
    "guided_engagement",
    "reflective_engagement",
    "full_cycle",
  ]),
  special_considerations: z.string().max(2000).optional(),
});

function buildUserMessage(input: z.infer<typeof RequestSchema>): string {
  const scopeLabel = {
    pre_engagement: "a pre-engagement phase only (no AI)",
    guided_engagement: "a guided-engagement phase only (bounded AI)",
    reflective_engagement: "a reflective-engagement phase only (open AI)",
    full_cycle: "a full three-phase cycle",
  }[input.scope];

  const lines = [
    `Design ${scopeLabel} for the following lesson.`,
    "",
    `Subject: ${input.subject}`,
    `Grade level: ${input.grade_level}`,
    `Concept: ${input.concept}`,
    `Learning objective: ${input.learning_objective}`,
    `Total class time: ${input.time_minutes} minutes`,
  ];
  if (input.special_considerations && input.special_considerations.trim()) {
    lines.push(`Special considerations: ${input.special_considerations.trim()}`);
  }
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
    const plan = await callLLM<LessonPlan>({
      system: LESSON_SYSTEM_PROMPT,
      user: buildUserMessage(parsed.data),
      json: true,
    });
    return Response.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM error";
    return Response.json({ error: message }, { status: 502 });
  }
}
