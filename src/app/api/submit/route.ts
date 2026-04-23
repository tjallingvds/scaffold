import { NextRequest } from "next/server";
import { z } from "zod";
import { getShared } from "@/lib/share-store";
import {
  saveSubmission,
  type StudentSubmissionBlob,
} from "@/lib/submission-store";

export const runtime = "nodejs";

const RequestSchema = z.object({
  share_id: z.string().min(1).max(64),
  data: z.object({
    assignment_title: z.string().max(400),
    assignment_topic: z.string().max(2000),
    submitted_at: z.string().max(64),
    phase1: z.object({
      known: z.string().max(10000),
      confused: z.string().max(10000),
      tried: z.string().max(10000),
    }),
    draft: z.string().max(40000),
    chat: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().max(20000),
        }),
      )
      .max(200),
    exchanges_used: z.number().int().min(0).max(500),
    reflection: z.object({
      changed: z.string().max(10000),
      accepted_rejected: z.string().max(10000),
      uncertain: z.string().max(10000),
    }),
    accessibility_profile: z.string().max(40).nullable().optional(),
  }),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Verify the share exists before accepting the submission.
  const share = await getShared(parsed.data.share_id);
  if (!share) {
    return Response.json(
      { error: "That share link is no longer active." },
      { status: 404 },
    );
  }

  const id = await saveSubmission(
    parsed.data.share_id,
    parsed.data.data as StudentSubmissionBlob,
  );
  return Response.json({ id });
}
