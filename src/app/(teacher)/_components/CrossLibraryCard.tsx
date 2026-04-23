"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readAllEntries, type LibraryEntry, type LibraryKind } from "./Library";

const HREF_BY_KIND: Record<LibraryKind, string> = {
  assignment: "/assignment",
  lesson: "/lesson",
  policy: "/policy",
  semester: "/semester",
  differentiation: "/differentiate",
};

const LABEL_BY_KIND: Record<LibraryKind, string> = {
  assignment: "Assignment",
  lesson: "Lesson",
  policy: "Policy",
  semester: "Semester plan",
  differentiation: "Differentiation",
};

export function CrossLibraryCard() {
  // Read synchronously at mount via useState initializer; only re-read on
  // storage events (which don't need setState-in-effect).
  const [entries, setEntries] = useState<LibraryEntry[]>(() =>
    typeof window === "undefined" ? [] : readAllEntries(),
  );

  useEffect(() => {
    function onStorage() {
      setEntries(readAllEntries());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (entries.length === 0) return null;

  const top = [...entries]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5);

  return (
    <section className="rounded-2xl border border-border bg-surface overflow-hidden">
      <header className="px-5 py-3 border-b border-border flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Pick up where you left off
        </h2>
        <span className="text-xs text-muted">Saved on this device</span>
      </header>
      <ul className="flex flex-col divide-y divide-border">
        {top.map((e) => (
          <li key={e.id}>
            <Link
              href={HREF_BY_KIND[e.kind]}
              className="flex items-center gap-3 px-5 py-3 hover:bg-subtle transition-colors"
            >
              <span className="text-[10px] uppercase tracking-wider text-muted font-semibold w-24 flex-shrink-0">
                {LABEL_BY_KIND[e.kind]}
              </span>
              <span className="text-sm text-foreground truncate flex-1">
                {e.title}
              </span>
              <span className="text-xs text-muted whitespace-nowrap">
                {new Date(e.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {e.share_id && (
                <span className="text-[10px] uppercase tracking-wider bg-accent-soft text-accent-ink px-2 py-0.5 rounded">
                  shared
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
