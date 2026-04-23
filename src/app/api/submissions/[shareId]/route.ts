import { NextRequest } from "next/server";
import { getSubmissionsForShare } from "@/lib/submission-store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ shareId: string }> },
) {
  const { shareId } = await ctx.params;
  if (!shareId) {
    return Response.json({ error: "Missing shareId" }, { status: 400 });
  }
  const submissions = await getSubmissionsForShare(shareId);
  return Response.json({ submissions });
}
