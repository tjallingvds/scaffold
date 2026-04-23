import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

// The only thing Scaffold persists is a share snapshot for a student link.
// No user accounts, no student data.
export const shares = pgTable("shares", {
  id: text("id").primaryKey(), // short slug
  plan: jsonb("plan").notNull(), // AssignmentPlan snapshot
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ShareRow = typeof shares.$inferSelect;
