import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shares } from "@/db/schema";
import type { AssignmentPlan } from "./types";
import { isDemoMode } from "./mode";
import { SAMPLE_ASSIGNMENT, SAMPLE_SHARE_ID } from "./sample-assignment";

declare global {
  var __scaffoldInMemShares: Map<string, AssignmentPlan> | undefined;
}

const memStore: Map<string, AssignmentPlan> =
  globalThis.__scaffoldInMemShares ?? new Map<string, AssignmentPlan>();
globalThis.__scaffoldInMemShares = memStore;

// Always-present sample so the "Try the student view" link works out of the box.
if (!memStore.has(SAMPLE_SHARE_ID)) {
  memStore.set(SAMPLE_SHARE_ID, SAMPLE_ASSIGNMENT);
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function saveShared(
  plan: AssignmentPlan,
  createdBy?: string | null
): Promise<string> {
  if (isDemoMode()) {
    let id = randomId();
    while (memStore.has(id)) id = randomId();
    memStore.set(id, plan);
    return id;
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = randomId();
    try {
      await db.insert(shares).values({
        id,
        plan: plan as unknown as object,
        createdBy: createdBy ?? null,
      });
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("duplicate key")) throw err;
    }
  }
  throw new Error("Could not allocate a unique share id");
}

export async function getShared(id: string): Promise<AssignmentPlan | null> {
  // Sample is always available regardless of mode.
  if (id === SAMPLE_SHARE_ID) return SAMPLE_ASSIGNMENT;
  if (isDemoMode()) return memStore.get(id) ?? null;
  const rows = await db
    .select({ plan: shares.plan })
    .from(shares)
    .where(eq(shares.id, id))
    .limit(1);
  if (rows.length === 0) return null;
  return rows[0].plan as AssignmentPlan;
}
