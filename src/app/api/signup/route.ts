import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";

const SignupSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  display_name: z.string().max(120).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const email = parsed.data.email.toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return Response.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const inserted = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      displayName: parsed.data.display_name?.trim() || null,
    })
    .returning({ id: users.id, email: users.email });
  return Response.json({ user: inserted[0] });
}
