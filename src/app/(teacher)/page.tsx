import Link from "next/link";
import { SAMPLE_ASSIGNMENT, SAMPLE_SHARE_ID } from "@/lib/sample-assignment";
import { ASSIGNMENT_EXAMPLES } from "@/lib/templates/assignment-examples";
import { CrossLibraryCard } from "./_components/CrossLibraryCard";

const FLAGSHIP = [
  {
    href: "/assignment",
    title: "Make an assignment",
    body: "A student-facing task with built-in draft area, Socratic AI tutor, rubric, and shareable link.",
    time: "~15 seconds",
  },
  {
    href: "/lesson",
    title: "Plan a lesson",
    body: "Three-phase in-class lesson with specific adaptations for neurodivergent students.",
    time: "~15 seconds",
  },
];

const SECONDARY = [
  { href: "/differentiate", title: "Differentiate a reading", body: "Parallel variants by learner profile." },
  { href: "/prompts", title: "UDL prompt library", body: "Fill, run, copy. Live." },
  { href: "/policy", title: "Classroom AI policy", body: "Syllabus + day-one guide + FAQ." },
  { href: "/semester", title: "Semester plan", body: "Template variety across a term." },
];

export default function Home() {
  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-10 py-10 sm:py-14 flex flex-col gap-10 sm:gap-14">
        <header className="flex flex-col gap-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
            What do you want to make?
          </h1>
          <div className="rounded-2xl border border-border bg-subtle p-5 flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
              What is Scaffold?
            </div>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl">
              A planning tool for teachers who want to use AI in class without
              letting it do the thinking for students. You describe what
              you&rsquo;re teaching. Scaffold writes the lesson plan,
              assignment, rubric, and a student-facing AI tutor that refuses to
              hand out answers. Every output is built around a three-phase
              cycle: students think first, then use AI as a check, then
              reflect.
            </p>
          </div>
        </header>

        {/* Resume recent work (only renders if there is any) */}
        <CrossLibraryCard />

        {/* Flagship actions */}
        <section className="grid gap-3 sm:grid-cols-2">
          {FLAGSHIP.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-2xl border border-border bg-surface p-5 hover:border-foreground transition-colors flex flex-col gap-2"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">{f.title}</h2>
                <span className="text-[10px] uppercase tracking-wider bg-subtle text-muted px-2 py-0.5 rounded whitespace-nowrap">
                  {f.time}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{f.body}</p>
              <span className="text-sm text-foreground font-medium mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                Start →
              </span>
            </Link>
          ))}
        </section>

        {/* Secondary tools */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Other tools</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {SECONDARY.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 hover:border-foreground transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">{s.title}</div>
                  <div className="text-xs text-muted mt-0.5 truncate">{s.body}</div>
                </div>
                <span className="text-foreground opacity-40 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick start assignments */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Or jump straight into one of these
            </h2>
            <p className="text-sm text-muted mt-1">
              Click one. Scaffold auto-generates the whole thing and gives you a
              share link.
            </p>
          </div>
          <ul className="flex flex-col border border-border rounded-2xl overflow-hidden divide-y divide-border bg-surface">
            {ASSIGNMENT_EXAMPLES.map((ex) => (
              <li key={ex.id}>
                <Link
                  href={`/assignment?example=${ex.id}&auto=1`}
                  className="group flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 hover:bg-subtle transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted mb-0.5 truncate">{ex.subject}</div>
                    <div className="text-sm font-medium text-foreground truncate">
                      {ex.short}
                    </div>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {ex.time_minutes} min
                  </span>
                  <span className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Try as a student */}
        <section className="flex flex-col gap-3 border-t border-border pt-8 sm:pt-10">
          <h2 className="text-base font-semibold text-foreground">
            First time here?
          </h2>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            See what you&rsquo;re about to ask of your class. Open the sample
            assignment the way your students will:{" "}
            <em>{SAMPLE_ASSIGNMENT.title}</em>. Three phases, about 20 minutes.
          </p>
          <Link
            href={`/student/${SAMPLE_SHARE_ID}`}
            target="_blank"
            className="self-start inline-flex items-center gap-1.5 rounded-full bg-foreground text-surface px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Open student view ↗
          </Link>
        </section>

        <footer className="border-t border-border pt-6 text-xs text-muted leading-relaxed">
          No student accounts, no student data stored. Scaffold is a teacher tool
          Students walk through share links anonymously.
        </footer>
      </div>
    </div>
  );
}
