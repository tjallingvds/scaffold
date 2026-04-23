import { NextRequest } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import { DIFFERENTIATION_SYSTEM_PROMPT } from "@/lib/prompts/differentiation";
import type { DifferentiationResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 90;

const PROFILES = [
  "reading_level_low",
  "reading_level_high",
  "adhd",
  "autism",
  "dyslexia",
  "ell_intermediate",
  "executive_function",
  "sensory_sensitivity",
  "cultural_context",
] as const;

const RequestSchema = z.object({
  source_text: z.string().min(20).max(20000),
  profiles: z.array(z.enum(PROFILES)).min(1).max(6),
  cultural_context: z.string().max(500).optional(),
});

function buildUserMessage(input: z.infer<typeof RequestSchema>): string {
  const lines = [
    "Produce one differentiated variant per requested profile.",
    "",
    `Requested profiles: ${input.profiles.join(", ")}`,
  ];
  if (input.profiles.includes("cultural_context") && input.cultural_context?.trim()) {
    lines.push(`Cultural context to use: ${input.cultural_context.trim()}`);
  }
  lines.push("", "Source text:", input.source_text);
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
    const result = await callLLM<DifferentiationResult>({
      system: DIFFERENTIATION_SYSTEM_PROMPT,
      user: buildUserMessage(parsed.data),
      json: true,
      temperature: 0.3,
    });
    return Response.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM error";
    return Response.json({ error: message }, { status: 502 });
  }
}
