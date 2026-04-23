import Link from "next/link";
import { SAMPLE_ASSIGNMENT, SAMPLE_SHARE_ID } from "@/lib/sample-assignment";
import { ASSIGNMENT_EXAMPLES } from "@/lib/templates/assignment-examples";

const BUILDERS = [
  {
    href: "/assignment",
    title: "Assignment",
    body: "Student-facing assignment + rubric + shareable link.",
    time: "~15s",
  },
  {
    href: "/lesson",
    title: "Lesson plan",
    body: "Three-phase lesson with specific neurodivergent adaptations.",
    time: "~15s",
  },
  {
    href: "/differentiate",
    title: "Differentiated reading",
    body: "Parallel versions of the same text for specific learner profiles.",
    time: "~15s",
  },
  {
    href: "/prompts",
    title: "UDL prompts",
    body: "Parameterized prompts. Fill the blanks, run in-app.",
    time: "live",
  },
  {
    href: "/policy",
    title: "Classroom AI policy",
    body: "Syllabus language, day-one discussion guide, student FAQ.",
    time: "~15s",
  },
  {
    href: "/semester",
    title: "Semester plan",
    body: "Spread assignment templates across a whole term for variety.",
    time: "~20s",
  },
];

export default function Home() {
  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-14 flex flex-col gap-14">
        <header className="flex flex-col gap-5">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
            What do you want to make?
          </h1>
          <div className="rounded-2xl border border-border bg-subtle p-5 flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
              What is Scaffold?
            </div>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl">
              A planning tool for teachers who want to use AI in class without
              letting it do the thinking for students. You describe what
              you&rsquo;re teaching - Scaffold writes the lesson plan,
              assignment, rubric, and a student-facing AI tutor that refuses to
              hand out answers. Every output is built around a three-phase
              cycle: students think first, then use AI as a check, then
              reflect.
            </p>
          </div>
        </header>

        {/* The six builders */}
        <section className="flex flex-col gap-2">
          <ul className="flex flex-col border border-border rounded-2xl overflow-hidden divide-y divide-border bg-surface">
            {BUILDERS.map((b) => (
              <li key={b.href}>
                <Link
                  href={b.href}
                  className="group flex items-center justify-between gap-5 px-5 py-5 hover:bg-subtle transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-medium text-foreground">
                      {b.title}
                    </div>
                    <div className="text-xs text-muted mt-0.5">{b.body}</div>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {b.time}
                  </span>
                  <span className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick start: example assignments (auto-generate) */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Quick start - ready-made assignments
            </h2>
            <p className="text-sm text-muted mt-1">
              Click one. Scaffold auto-generates the whole thing and gives you a
              share link. Edit anything after.
            </p>
          </div>
          <ul className="flex flex-col border border-border rounded-2xl overflow-hidden divide-y divide-border bg-surface">
            {ASSIGNMENT_EXAMPLES.map((ex) => (
              <li key={ex.id}>
                <Link
                  href={`/assignment?example=${ex.id}&auto=1`}
                  className="group flex items-center justify-between gap-5 px-5 py-4 hover:bg-subtle transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted mb-0.5">{ex.subject}</div>
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
        <section className="flex flex-col gap-3 border-t border-border pt-10">
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
          - students walk through share links anonymously.
        </footer>
      </div>
    </div>
  );
}
