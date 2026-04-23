import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";

// Teachers only - never students.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  defaultSubject: text("default_subject"),
  defaultGradeLevel: text("default_grade_level"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    subject: text("subject").notNull(),
    gradeLevel: text("grade_level").notNull(),
    plan: jsonb("plan").notNull(), // LessonPlan
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lessons_user_id_idx").on(t.userId)]
);

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    template: text("template").notNull(),
    title: text("title").notNull(),
    topic: text("topic").notNull(),
    gradeLevel: text("grade_level").notNull(),
    plan: jsonb("plan").notNull(), // AssignmentPlan
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("assignments_user_id_idx").on(t.userId)]
);

// Public share links for students - no student data stored, just a snapshot of the plan.
export const shares = pgTable("shares", {
  id: text("id").primaryKey(), // short slug
  plan: jsonb("plan").notNull(), // AssignmentPlan snapshot
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type LessonRow = typeof lessons.$inferSelect;
export type AssignmentRow = typeof assignments.$inferSelect;
export type ShareRow = typeof shares.$inferSelect;
