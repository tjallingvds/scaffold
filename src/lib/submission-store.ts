import { desc, eq } from "drizzle-orm";

export interface StudentSubmissionBlob {
  assignment_title: string;
  assignment_topic: string;
  submitted_at: string; // ISO
  phase1: { known: string; confused: string; tried: string };
  draft: string;
  chat: { role: "user" | "assistant"; content: string }[];
  exchanges_used: number;
  reflection: {
    changed: string;
    accepted_rejected: string;
    uncertain: string;
  };
  accessibility_profile?: string | null;
}

export interface StoredSubmission {
  id: string;
  share_id: string;
  data: StudentSubmissionBlob;
  submitted_at: string; // ISO
}

declare global {
  var __scaffoldInMemSubmissions:
    | Map<string, StoredSubmission[]>
    | undefined;
}

const memStore: Map<string, StoredSubmission[]> =
  globalThis.__scaffoldInMemSubmissions ?? new Map<string, StoredSubmission[]>();
globalThis.__scaffoldInMemSubmissions = memStore;

function canUseDb(): boolean {
  return !!process.env.DATABASE_URL;
}

function randomId(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

export async function saveSubmission(
  shareId: string,
  data: StudentSubmissionBlob,
): Promise<string> {
  const submittedAt = new Date().toISOString();
  const memId = randomId();

  if (canUseDb()) {
    try {
      const { db } = await import("@/db");
      const { submissions } = await import("@/db/schema");
      const inserted = await db
        .insert(submissions)
        .values({ shareId, data: data as unknown as object })
        .returning({ id: submissions.id, submittedAt: submissions.submittedAt });
      const entry: StoredSubmission = {
        id: inserted[0].id,
        share_id: shareId,
        data,
        submitted_at: inserted[0].submittedAt.toISOString(),
      };
      const list = memStore.get(shareId) ?? [];
      memStore.set(shareId, [entry, ...list]);
      return entry.id;
    } catch (err) {
      console.warn(
        "[submission-store] DB write failed, falling back to memory:",
        err,
      );
    }
  }

  const entry: StoredSubmission = {
    id: memId,
    share_id: shareId,
    data,
    submitted_at: submittedAt,
  };
  const list = memStore.get(shareId) ?? [];
  memStore.set(shareId, [entry, ...list]);
  return memId;
}

export async function getSubmissionsForShare(
  shareId: string,
): Promise<StoredSubmission[]> {
  if (canUseDb()) {
    try {
      const { db } = await import("@/db");
      const { submissions } = await import("@/db/schema");
      const rows = await db
        .select()
        .from(submissions)
        .where(eq(submissions.shareId, shareId))
        .orderBy(desc(submissions.submittedAt));
      return rows.map((r) => ({
        id: r.id,
        share_id: r.shareId,
        data: r.data as StudentSubmissionBlob,
        submitted_at: r.submittedAt.toISOString(),
      }));
    } catch (err) {
      console.warn("[submission-store] DB read failed, using memory:", err);
    }
  }
  return memStore.get(shareId) ?? [];
}
