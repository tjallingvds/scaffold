import { NextRequest } from "next/server";
import { saveShared } from "@/lib/share-store";
import type { AssignmentPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { plan?: AssignmentPlan };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.plan || typeof body.plan !== "object") {
    return Response.json({ error: "Missing plan" }, { status: 400 });
  }
  const id = await saveShared(body.plan, null);
  return Response.json({ id });
}
