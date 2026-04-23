import { NextRequest } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import { ASSIGNMENT_SYSTEM_PROMPT } from "@/lib/prompts/assignment";
import { LESSON_SYSTEM_PROMPT } from "@/lib/prompts/lesson";
import { POLICY_SYSTEM_PROMPT } from "@/lib/prompts/policy";
import { SEMESTER_SYSTEM_PROMPT } from "@/lib/prompts/semester";
import { DIFFERENTIATION_SYSTEM_PROMPT } from "@/lib/prompts/differentiation";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  kind: z.enum([
    "assignment",
    "lesson",
    "policy",
    "semester",
    "differentiation",
  ]),
  current: z.record(z.string(), z.unknown()),
  instruction: z.string().min(1).max(2000),
});

const SYSTEM_BY_KIND: Record<string, string> = {
  assignment: ASSIGNMENT_SYSTEM_PROMPT,
  lesson: LESSON_SYSTEM_PROMPT,
  policy: POLICY_SYSTEM_PROMPT,
  semester: SEMESTER_SYSTEM_PROMPT,
  differentiation: DIFFERENTIATION_SYSTEM_PROMPT,
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const system = SYSTEM_BY_KIND[parsed.data.kind];
  if (!system) {
    return Response.json({ error: "Unknown kind" }, { status: 400 });
  }

  const user = [
    `You are REVISING an existing ${parsed.data.kind} plan. Apply only the teacher's requested change; preserve everything else unchanged. Return the full updated plan in the same JSON shape as before.`,
    "",
    "Current plan (JSON):",
    JSON.stringify(parsed.data.current, null, 2),
    "",
    "Teacher's revision request:",
    parsed.data.instruction,
    "",
    "Return only valid JSON in the same shape the original was generated in.",
  ].join("\n");

  try {
    const result = await callLLM<Record<string, unknown>>({
      system,
      user,
      json: true,
      temperature: 0.35,
    });
    return Response.json({ plan: result });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "LLM error" },
      { status: 502 },
    );
  }
}
