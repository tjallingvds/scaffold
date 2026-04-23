// Heuristic: flag inputs that look like they contain student-identifying info.
// This is a soft warning only - the ultimate responsibility is the teacher's.

const SUSPICIOUS_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "email address", re: /[\w.+-]+@[\w-]+\.[\w.-]+/ },
  { label: "phone number", re: /(?<!\d)(\+?\d[\d\s().-]{8,}\d)(?!\d)/ },
  { label: "SSN", re: /(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)/ },
  { label: "student ID", re: /\b(student\s*(id|#|number)|id[:#]?\s*\d{4,})/i },
  { label: "IEP mention", re: /\b(iep|504 plan)\b/i },
];

export interface PIIFinding {
  label: string;
  excerpt: string;
}

export function scanForPII(input: string): PIIFinding[] {
  if (!input) return [];
  const findings: PIIFinding[] = [];
  for (const { label, re } of SUSPICIOUS_PATTERNS) {
    const match = input.match(re);
    if (match) {
      const start = Math.max(0, (match.index ?? 0) - 10);
      const end = Math.min(input.length, (match.index ?? 0) + match[0].length + 10);
      findings.push({ label, excerpt: input.slice(start, end) });
    }
  }
  return findings;
}
