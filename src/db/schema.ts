import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";

// The only things Scaffold persists are:
//   shares       — the assignment plan a teacher handed to their students
//   submissions  — student work submitted back through that share link
// No user accounts, no personally identifying student data.

export const shares = pgTable("shares", {
  id: text("id").primaryKey(), // short slug
  plan: jsonb("plan").notNull(), // AssignmentPlan snapshot
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shareId: text("share_id")
      .notNull()
      .references(() => shares.id, { onDelete: "cascade" }),
    data: jsonb("data").notNull(), // the compiled student submission blob
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("submissions_share_id_idx").on(t.shareId)],
);

export type ShareRow = typeof shares.$inferSelect;
export type SubmissionRow = typeof submissions.$inferSelect;
