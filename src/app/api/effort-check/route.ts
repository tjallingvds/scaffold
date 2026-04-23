import { NextRequest } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import { EFFORT_CHECK_SYSTEM_PROMPT } from "@/lib/prompts/effort-check";

export const runtime = "nodejs";
export const maxDuration = 30;

const RequestSchema = z.object({
  topic: z.string().min(1).max(1000),
  attempt: z.string().min(1).max(10000),
});

interface EffortCheckResult {
  effort_shown: boolean;
  feedback: string;
  encouragement: string;
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
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const user = [
    `Assignment topic:`,
    parsed.data.topic,
    ``,
    `Student's first-attempt text:`,
    parsed.data.attempt,
  ].join("\n");

  try {
    const result = await callLLM<EffortCheckResult>({
      system: EFFORT_CHECK_SYSTEM_PROMPT,
      user,
      json: true,
      temperature: 0.2,
    });
    return Response.json(result);
  } catch (err) {
    // Fail open: if the LLM misbehaves, let the student proceed rather than
    // block them based on a technical fault.
    return Response.json(
      {
        effort_shown: true,
        feedback: "",
        encouragement: "",
        _fallback: true,
        _error: err instanceof Error ? err.message : "LLM error",
      },
      { status: 200 }
    );
  }
}
