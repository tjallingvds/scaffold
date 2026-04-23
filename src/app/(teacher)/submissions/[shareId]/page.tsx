"use client";

import { use, useEffect, useState } from "react";
import { PageFrame } from "../../_components/PageFrame";
import type { StoredSubmission } from "@/lib/submission-store";

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = use(params);
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/api/submissions/${encodeURIComponent(shareId)}`);
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(data.error || `HTTP ${res.status}`);
          return;
        }
        setSubmissions(data.submissions ?? []);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [shareId]);

  return (
    <PageFrame title="Student submissions">
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-6">
          <div className="text-sm text-muted">
            Share link:{" "}
            <a
              href={`/student/${shareId}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-foreground hover:underline"
            >
              /student/{shareId}
            </a>
            {" · auto-refreshes every 10s"}
          </div>

          {loading && submissions.length === 0 && (
            <div className="text-sm text-muted">Loading…</div>
          )}

          {error && (
            <div className="rounded-xl border border-error/25 bg-error-soft px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {!loading && submissions.length === 0 && !error && (
            <div className="rounded-2xl border border-dashed border-border bg-subtle p-6 text-sm text-muted">
              No submissions yet. When a student finishes and taps <em>Submit to your teacher</em>, their work will appear here.
            </div>
          )}

          <ul className="flex flex-col gap-3">
            {submissions.map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </ul>
        </div>
      </div>
    </PageFrame>
  );
}

function SubmissionCard({ submission }: { submission: StoredSubmission }) {
  const [open, setOpen] = useState(false);
  const d = submission.data;
  const when = new Date(submission.submitted_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <li className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-subtle transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">
            {d.assignment_title}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {when} · {d.exchanges_used} round
            {d.exchanges_used === 1 ? "" : "s"}
            {d.accessibility_profile
              ? ` · profile: ${d.accessibility_profile}`
              : ""}
          </div>
        </div>
        <span className="text-muted text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-4 flex flex-col gap-5 bg-subtle/30">
          <Block label="Phase 1 · What they knew">{d.phase1.known}</Block>
          <Block label="Phase 1 · What confused them">{d.phase1.confused}</Block>
          <Block label="Phase 1 · What they had tried">{d.phase1.tried}</Block>
          <Block label="Phase 2 · Draft (student's own words)">{d.draft}</Block>
          {d.chat.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1.5">
                Phase 2 · AI tutor log
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
                {d.chat.map((t, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-2">
                      {t.role === "user" ? "Student" : "Tutor"}
                    </span>
                    <span className="text-foreground whitespace-pre-wrap">
                      {t.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Block label="Phase 3 · What changed">{d.reflection.changed}</Block>
          <Block label="Phase 3 · Accepted / rejected AI suggestions">
            {d.reflection.accepted_rejected}
          </Block>
          <Block label="Phase 3 · Still uncertain">
            {d.reflection.uncertain}
          </Block>
        </div>
      )}
    </li>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  if (!children?.trim()) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted mb-1">
        {label}
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {children}
      </p>
    </div>
  );
}
