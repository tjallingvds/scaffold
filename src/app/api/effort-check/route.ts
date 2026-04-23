import { NextRequest } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import { EFFORT_CHECK_SYSTEM_PROMPT } from "@/lib/prompts/effort-check";

export const runtime = "nodejs";
export const maxDuration = 30;

const PROFILE_HINTS: Record<string, string> = {
  adhd:
    "This student has ADHD. Short attempts are fine — what matters is whether they actually engaged. Don't require length.",
  autism:
    "This student is autistic. Literal or very factual answers are genuine effort. Don't penalize for lack of figurative language.",
  dyslexia:
    "This student has dyslexia. Spelling, grammar, and sentence length don't matter. Look only at whether they engaged with the topic.",
  ell_intermediate:
    "This student is an English Language Learner. Imperfect English or short sentences are fine. Judge effort on engagement with the topic, NOT on English fluency.",
  executive_function:
    "This student benefits from executive-function support. If they made any concrete start, count it as effort.",
  sensory_sensitivity:
    "This student has sensory sensitivity. Measured, short responses are normal and should count as effort.",
  reading_level_low:
    "This student benefits from a lower reading level. Judge effort on ideas expressed, not vocabulary or sentence complexity.",
  reading_level_high: "",
};

const RequestSchema = z.object({
  topic: z.string().min(1).max(1000),
  attempt: z.string().min(1).max(10000),
  profile: z.string().max(40).optional(),
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

  const profileHint = parsed.data.profile
    ? PROFILE_HINTS[parsed.data.profile] ?? ""
    : "";

  const user = [
    `Assignment topic:`,
    parsed.data.topic,
    ``,
    `Student's first-attempt text:`,
    parsed.data.attempt,
    ...(profileHint ? ["", `Extra context: ${profileHint}`] : []),
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
