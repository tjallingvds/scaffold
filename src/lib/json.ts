// Robust JSON extraction for LLM output. Some models wrap JSON in code fences or
// add prose around it even when asked not to.
export function extractJSON<T = unknown>(raw: string): T {
  const trimmed = raw.trim();
  // Strip ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1]);
  }
  // Try direct parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall through to bracket scan
  }
  // Find the first { and last matching }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) {
    return JSON.parse(trimmed.slice(first, last + 1));
  }
  throw new Error("Could not extract JSON from model output");
}
