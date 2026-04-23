import { NextRequest } from "next/server";
import { z } from "zod";
import { DEEPSEEK_MODEL, getDeepSeekClient } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 60;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const RequestSchema = z.object({
  system: z.string().min(1).max(10000),
  messages: z.array(MessageSchema).min(1).max(20),
});

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
  try {
    const client = getDeepSeekClient();
    const completion = await client.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: parsed.data.system },
        ...parsed.data.messages,
      ],
      temperature: 0.6,
    });
    const reply = completion.choices[0]?.message?.content ?? "";
    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM error";
    return Response.json({ error: message }, { status: 502 });
  }
}
