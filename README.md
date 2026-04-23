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

1. **Create a new Railway project**, add a **Postgres** plugin.
2. Add a **service** from this GitHub repo. Railway's Nixpacks builder uses `railway.json` automatically.
3. Set these env vars on the service:

   | Variable            | Value                                                  |
   | ------------------- | ------------------------------------------------------ |
   | `DEEPSEEK_API_KEY`  | your DeepSeek key                                      |
   | `DEEPSEEK_MODEL`    | `deepseek-chat` (default)                              |
   | `DATABASE_URL`      | `${{ Postgres.DATABASE_URL }}` (Railway reference)     |
   | `AUTH_SECRET`       | `openssl rand -base64 32`                              |
   | `NEXTAUTH_URL`      | `https://<your-service>.up.railway.app`                |
   | `AUTH_TRUST_HOST`   | `true`                                                 |

4. **Apply the schema** once — from your machine:
   ```bash
   DATABASE_URL="<railway public url>" npm run db:push
   ```
   (Or run it in Railway's web shell.)

5. Deploy. Sign up at `https://<your-service>.up.railway.app/signup`.

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
