import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { saveShared } from "@/lib/share-store";
import { isDemoMode } from "@/lib/mode";
import type { AssignmentPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  if (!isDemoMode()) {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    userId = session.user.id;
  }
  let body: { plan?: AssignmentPlan };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.plan || typeof body.plan !== "object") {
    return Response.json({ error: "Missing plan" }, { status: 400 });
  }
  const id = await saveShared(body.plan, userId);
  return Response.json({ id });
}
