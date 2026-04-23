# Scaffold

A lesson and assignment planner for AI-augmented inclusive education, built on the Scaffolded Mind framework.

Two sides in one app:
- **Teacher** (authenticated) — builds lessons, assignments, differentiations, policies, semester plans.
- **Student** (anonymous, link-based) — walks through the three-phase cycle with a bounded Socratic tutor. No student data stored.

## Running locally

```bash
# 1. Install
npm install

# 2. Spin up Postgres (needs Docker)
docker compose up -d
# ...or point DATABASE_URL at your own Postgres instead.

# 3. Copy env
cp .env.local.example .env.local

# 4. Fill in:
#    DEEPSEEK_API_KEY   — from https://platform.deepseek.com/
#    AUTH_SECRET        — openssl rand -base64 32
#    DATABASE_URL       — default matches docker compose:
#                         postgres://scaffold:scaffold@localhost:5432/scaffold

# 5. Create tables
npm run db:push

# 6. Dev
npm run dev
# open http://localhost:3000
```

Sign up at `/signup`, then use the teacher side. Shared assignment links live at `/student/<id>` and require no student account.

## Deploying to Railway

Simplest path — no auth, no database needed. Shares live in memory.

1. Create a Railway project, add a service from this GitHub repo.
2. Deploy. That's it.

A baked-in DeepSeek key ships with the repo for demo use, and the share store automatically falls back to an in-memory map. Teachers use the app without signing in.

Optional upgrades:

- **Override the DeepSeek key.** Set `DEEPSEEK_API_KEY` to your own key.
- **Persist share links across restarts.** Add the Postgres plugin and set `DATABASE_URL=${{ Postgres.DATABASE_URL }}`, then apply the schema: `DATABASE_URL="<railway url>" npm run db:push`. The app will use the DB automatically when present and fall back to memory if the write fails.
- **Re-enable auth.** Set `ENABLE_AUTH=true` plus `AUTH_SECRET` and `NEXTAUTH_URL`. Teacher routes will be gated behind `/login`.

## Architecture

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4.
- **Postgres** via Drizzle ORM. Tables: `users`, `lessons`, `assignments`, `shares`.
- **Auth.js v5** (NextAuth) — credentials provider, bcrypt-hashed passwords, JWT sessions.
- **LLM**: DeepSeek via the OpenAI-compatible chat completions API.
- **No student data**: the `shares` table stores only the assignment plan snapshot; students interact with the app anonymously via a share link.

## The five principles

1. AI as Scaffold, not Substitute.
2. Protect Desirable Difficulty.
3. Delay Automation.
4. Preserve Epistemic Agency.
5. Design for Cognitive Variability.

## Routes

### Teacher (protected)

| Route             | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `/`               | Dashboard                                                 |
| `/lesson`         | Three-phase lesson builder                                |
| `/assignment`     | Five assignment templates, SHAPR rubric, Socratic prompt  |
| `/differentiate`  | UDL-aligned variants of existing material                 |
| `/prompts`        | Curated UDL prompt library                                |
| `/policy`         | Classroom AI policy writer                                |
| `/semester`       | Semester plan                                             |
| `/settings`       | Local prefs + privacy summary                             |

### Public

| Route             | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `/login`          | Sign in                                                   |
| `/signup`         | Create teacher account                                    |
| `/student/[id]`   | Student walk-through: three phases + Socratic tutor       |
