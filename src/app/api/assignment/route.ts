import { NextRequest } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import { ASSIGNMENT_SYSTEM_PROMPT } from "@/lib/prompts/assignment";
import type { AssignmentPlan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  template: z.enum([
    "compare_critique",
    "ai_feedback",
    "multi_perspective",
    "break_ai",
    "scaffolded_exploration",
  ]),
  topic: z.string().min(1).max(500),
  subject: z.string().min(1).max(200),
  grade_level: z.string().min(1).max(100),
  time_minutes: z.number().int().min(10).max(300),
  special_considerations: z.string().max(2000).optional(),
});

function buildUserMessage(input: z.infer<typeof RequestSchema>): string {
  const lines = [
    `Design an assignment using the "${input.template}" template.`,
    "",
    `Subject: ${input.subject}`,
    `Grade level: ${input.grade_level}`,
    `Topic: ${input.topic}`,
    `Total time: ${input.time_minutes} minutes`,
  ];
  if (input.special_considerations?.trim()) {
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
    const plan = await callLLM<AssignmentPlan>({
      system: ASSIGNMENT_SYSTEM_PROMPT,
      user: buildUserMessage(parsed.data),
      json: true,
    });
    return Response.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM error";
    return Response.json({ error: message }, { status: 502 });
  }
}
