"use client";

import { scanForPII } from "@/lib/pii";

export function PIINotice({ text }: { text: string }) {
  const findings = scanForPII(text);
  if (findings.length === 0) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-warn/30 bg-warn-soft text-warn px-3 py-2 text-xs"
    >
      <div className="font-semibold uppercase tracking-wide mb-1">
        Possible student information
      </div>
      <div className="text-foreground/80">
        Detected: {findings.map((f) => f.label).join(", ")}. Scaffold is a teacher tool
        and should not hold student-identifying data - please remove it before generating.
      </div>
    </div>
  );
}
