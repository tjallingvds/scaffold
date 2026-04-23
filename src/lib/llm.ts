import { DEEPSEEK_MODEL, getDeepSeekClient } from "./deepseek";
import { extractJSON } from "./json";

export interface CallLLMOptions {
  system: string;
  user: string;
  temperature?: number;
  json?: boolean;
}

export async function callLLM<T = unknown>(opts: CallLLMOptions): Promise<T> {
  const client = getDeepSeekClient();
  const completion = await client.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    temperature: opts.temperature ?? 0.4,
    ...(opts.json ? { response_format: { type: "json_object" as const } } : {}),
  });
  const raw = completion.choices[0]?.message?.content ?? "";
  if (opts.json) {
    return extractJSON<T>(raw);
  }
  return raw as unknown as T;
}
