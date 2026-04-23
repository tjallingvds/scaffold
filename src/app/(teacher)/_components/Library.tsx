"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type LibraryKind =
  | "lesson"
  | "assignment"
  | "policy"
  | "semester"
  | "differentiation";

export interface LibraryEntry<T = unknown> {
  id: string;
  kind: LibraryKind;
  title: string;
  created_at: string;
  data: T;
  // Optional share-related metadata.
  share_id?: string | null;
}

const STORAGE_KEY = "scaffold.library.v1";
const MAX_ENTRIES = 20;

function readAll(): LibraryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as LibraryEntry[]) ?? [];
  } catch {
    return [];
  }
}

function writeAll(entries: LibraryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore quota */
  }
}

export function useLibrary(kind: LibraryKind) {
  const [entries, setEntries] = useState<LibraryEntry[]>(() =>
    readAll().filter((e) => e.kind === kind),
  );

  useEffect(() => {
    function onStorage() {
      setEntries(readAll().filter((e) => e.kind === kind));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [kind]);

  const save = useCallback(
    (title: string, data: unknown, share_id: string | null = null) => {
      const all = readAll();
      const id = Math.random().toString(36).slice(2, 10);
      const entry: LibraryEntry = {
        id,
        kind,
        title,
        created_at: new Date().toISOString(),
        data,
        share_id,
      };
      // Dedupe by (kind, title) keeping newest.
      const deduped = [
        entry,
        ...all.filter((e) => !(e.kind === kind && e.title === title)),
      ];
      writeAll(deduped);
      setEntries(deduped.filter((e) => e.kind === kind));
      return id;
    },
    [kind],
  );

  const updateShareId = useCallback(
    (entryId: string, share_id: string) => {
      const all = readAll();
      const updated = all.map((e) =>
        e.id === entryId ? { ...e, share_id } : e,
      );
      writeAll(updated);
      setEntries(updated.filter((e) => e.kind === kind));
    },
    [kind],
  );

  const remove = useCallback(
    (id: string) => {
      const all = readAll().filter((e) => e.id !== id);
      writeAll(all);
      setEntries(all.filter((e) => e.kind === kind));
    },
    [kind],
  );

  return { entries, save, remove, updateShareId };
}

export function RecentList<T>({
  entries,
  onPick,
  onRemove,
}: {
  entries: LibraryEntry<T>[];
  onPick: (entry: LibraryEntry<T>) => void;
  onRemove: (id: string) => void;
}) {
  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [entries],
  );

  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-subtle p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent</h3>
        <span className="text-xs text-muted">Saved on this device</span>
      </div>
      <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
        {sorted.slice(0, 5).map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <button
              type="button"
              onClick={() => onPick(e)}
              className="flex-1 text-left min-w-0"
            >
              <div className="text-sm font-medium text-foreground truncate">
                {e.title}
              </div>
              <div className="text-xs text-muted">
                {new Date(e.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {e.share_id ? " · shared" : ""}
              </div>
            </button>
            {e.share_id && (
              <a
                href={`/student/${e.share_id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted hover:text-foreground whitespace-nowrap"
                onClick={(ev) => ev.stopPropagation()}
              >
                Link ↗
              </a>
            )}
            <button
              type="button"
              onClick={() => onRemove(e.id)}
              className="text-xs text-muted hover:text-error whitespace-nowrap"
              aria-label="Remove from library"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
