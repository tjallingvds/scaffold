CREATE TABLE "shares" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
