import Link from "next/link";
import { PageFrame } from "../_components/PageFrame";

export default function AboutPage() {
  return (
    <PageFrame title="Why Scaffold exists">
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10 flex flex-col gap-14">
          {/* The problem */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              The problem
            </h2>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl">
              Large language models can support understanding. They can also
              replace the cognitive effort that makes learning stick. When
              students rely on AI too early or too often, they skip retrieval,
              reasoning, and reflection. Those are the processes that actually
              build knowledge.
            </p>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl">
              But banning AI is not the answer either. Students already use it.
              Teachers already use it. The same properties that make AI
              pedagogically risky (fluent output, quick explanations) make it a
              powerful support for inclusion if used intentionally.
            </p>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl font-medium">
              Scaffold is how we structure that middle ground. It uses AI to
              enable inclusive, personalized education while preserving
              cognitive effort and deep learning.
            </p>
          </section>

          {/* Five principles */}
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Five guiding principles
              </h2>
              <p className="text-sm text-muted mt-1">
                Enforced at the product level, not left to goodwill.
              </p>
            </div>
            <ol className="flex flex-col gap-3">
              <Principle
                n={1}
                name="AI as Scaffold, not Substitute"
                summary="AI should support your process of organization and clarification, not replace reasoning."
                practice="Use AI to generate perspectives, not final answers."
                avoid="Copying or relying on AI outputs without processing them."
                inApp="The student-facing tutor answers factual questions but refuses to write theses, drafts, or complete answers. The student always writes the draft themselves."
              />
              <Principle
                n={2}
                name="Protect Desirable Difficulty"
                summary="Learning requires effort. Productive struggle, within reach, is essential for knowledge retention and transfer."
                practice="Students try to solve tasks or understand concepts before using AI."
                avoid="Using AI to resolve every uncertainty immediately, skipping critical thinking."
                inApp="Step 1 is AI off. An effort check gate reviews the student's first attempt before the AI unlocks. A placeholder answer (&ldquo;idk&rdquo;) does not pass."
              />
              <Principle
                n={3}
                name="Delay Automation"
                summary="AI should come after initial engagement, not before."
                practice="Think first, then consult AI."
                avoid="Starting tasks with AI."
                inApp="The AI tutor does not appear in Step 1. Students must write what they already know, what confuses them, and what they have tried before moving on."
              />
              <Principle
                n={4}
                name="Preserve Epistemic Agency"
                summary="Learners must actively evaluate, question, and refine knowledge. The student, not the AI, is the judge of what is true."
                practice="Compare AI outputs with your own reasoning."
                avoid="Treating AI as an authority."
                inApp="The reflection step asks the student which AI suggestions they accepted, which they rejected, and why. Rejecting with a reason is often stronger than accepting."
              />
              <Principle
                n={5}
                name="Design for Cognitive Variability"
                summary="Learning is not one-size-fits-all. Instruction should provide multiple ways to engage with content."
                practice="Use AI to generate different formats (simple, visual, step by step). Adapt to neurodivergent profiles."
                avoid="Relying on a single explanation for all learners."
                inApp="Differentiation Studio produces parallel variants for ADHD, dyslexia, ELL, executive function, autism, sensory sensitivity, cultural context, and reading level. Students can also pick their own profile in the student workspace, which changes how the AI tutor responds to them."
              />
            </ol>
          </section>

          {/* The three-phase cycle */}
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Why students see three steps
              </h2>
              <p className="text-sm text-muted mt-1">
                AI should not be equally available at all times.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Phase
                n={1}
                label="Initial exposure"
                state="AI off"
                body="Students commit to a first attempt in their own words. Three short questions: what do I already know, what is confusing, what have I tried."
              />
              <Phase
                n={2}
                label="Practice"
                state="Bounded AI"
                body="Students write their actual draft and talk to a Socratic tutor about it. The tutor answers facts, refuses to do the thinking."
              />
              <Phase
                n={3}
                label="Reflection"
                state="Open AI"
                body="Students write a short reflection: what changed, which AI suggestions they took or rejected, what they are still uncertain about."
              />
            </div>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl">
              The order matters. Committing first protects initial encoding.
              Bounded AI during practice prevents outsourcing. Reflection turns
              the work into learning the student actually keeps.
            </p>
          </section>

          {/* Division of labor */}
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                What AI should do. What people should do.
              </h2>
              <p className="text-sm text-muted mt-1">
                Reducing overload without removing the teacher&rsquo;s role or
                the student&rsquo;s thinking.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold mb-2">
                  AI handles
                </div>
                <ul className="flex flex-col gap-1.5 text-sm text-foreground">
                  <li>Formatting</li>
                  <li>Summarizing</li>
                  <li>Reframing</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold mb-2">
                  Teachers and students handle
                </div>
                <ul className="flex flex-col gap-1.5 text-sm text-foreground">
                  <li>Reasoning</li>
                  <li>Argumentation</li>
                  <li>Interpretation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How teachers use Scaffold */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              How to use Scaffold
            </h2>

            <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
                For teachers
              </div>
              <ol className="flex flex-col gap-2 text-sm text-foreground list-decimal pl-5">
                <li>
                  Pick what to make on the{" "}
                  <Link href="/" className="font-medium hover:underline">
                    home page
                  </Link>
                  . Assignment, lesson, differentiated reading, classroom AI
                  policy, or semester plan.
                </li>
                <li>
                  Describe what you are teaching. Scaffold generates the whole
                  thing in about 15 seconds.
                </li>
                <li>
                  Use the <em>Ask the AI to edit this</em> box to tweak without
                  regenerating from scratch.
                </li>
                <li>
                  For assignments and lessons, tap <em>Create student link</em>{" "}
                  or <em>Make available to students</em>. Paste the URL in your
                  LMS.
                </li>
                <li>
                  Open <em>View submissions</em> to see student work as it comes
                  in. Auto-refreshes.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
                For students
              </div>
              <ol className="flex flex-col gap-2 text-sm text-foreground list-decimal pl-5">
                <li>Open the share link. No account needed.</li>
                <li>
                  Step 1: answer three questions in their own words. AI is off.
                </li>
                <li>
                  Step 2: write a draft. Talk to the AI tutor about it. The
                  tutor pushes back on thinking questions and answers factual
                  ones.
                </li>
                <li>
                  Step 3: answer three reflection questions about what changed.
                </li>
                <li>Submit. The teacher sees the work on their inbox.</li>
              </ol>
              <p className="text-xs text-muted leading-relaxed mt-1">
                The <span aria-hidden>♿</span> button in the student header
                adapts the interface and the tutor&rsquo;s tone to specific
                learner profiles (ADHD, autism, dyslexia, ELL, executive
                function, sensory sensitivity, or reading level).
              </p>
            </div>
          </section>

          {/* Sample activities */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Assignment templates built in
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <SampleActivity
                name="Compare & Critique"
                body="Student writes an answer independently. AI generates an alternative. Student evaluates both."
                goal="Develop evaluative judgment."
              />
              <SampleActivity
                name="AI as Feedback Tool"
                body="Student submits a draft. AI critiques it (no rewriting). Student revises and justifies which feedback they took."
                goal="Improve revision and reflection skills."
              />
              <SampleActivity
                name="Multi-Perspective Analysis"
                body="Student commits to an interpretation. AI surfaces alternative readings. Student writes a synthesis."
                goal="Strengthen interpretive and argumentative reasoning."
              />
              <SampleActivity
                name="Break the AI"
                body="Student probes AI for errors, biases, or gaps on a specific topic. Reports what they found and why it matters."
                goal="Build critical evaluation and AI literacy."
              />
              <SampleActivity
                name="Scaffolded Exploration"
                body="Student owns their research question. AI maps the terrain only. The research and writing stay the student&rsquo;s."
                goal="Support student-directed inquiry without shortcutting it."
              />
            </div>
          </section>

          {/* Caveats */}
          <section className="flex flex-col gap-3 border-t border-border pt-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              What this tool cannot do
            </h2>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl">
              AI is not a neutral tool. It reflects biases in its training
              data. It is still largely text-based. It can encourage
              over-reliance if the structure around it is weak.
            </p>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl">
              Scaffold mitigates these risks, but does not eliminate them. The
              effectiveness of the framework depends on whether teachers hold
              the line on the process, and whether students engage with it in
              good faith.
            </p>
          </section>

          <footer className="border-t border-border pt-6 flex flex-col gap-2">
            <Link
              href="/"
              className="text-sm text-foreground font-medium hover:underline self-start"
            >
              ← Back to the builders
            </Link>
          </footer>
        </div>
      </div>
    </PageFrame>
  );
}

function Principle({
  n,
  name,
  summary,
  practice,
  avoid,
  inApp,
}: {
  n: number;
  name: string;
  summary: string;
  practice: string;
  avoid: string;
  inApp: string;
}) {
  return (
    <li className="rounded-2xl border border-border bg-surface p-5 flex items-start gap-4">
      <span
        aria-hidden
        className="flex-shrink-0 w-9 h-9 rounded-full bg-subtle border border-border text-accent-ink font-semibold flex items-center justify-center text-base"
      >
        {n}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted leading-relaxed mt-0.5">{summary}</p>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2 text-xs">
          <div>
            <dt className="uppercase tracking-wider text-muted font-semibold">
              In practice
            </dt>
            <dd className="text-foreground leading-relaxed mt-0.5">
              {practice}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider text-muted font-semibold">
              Avoid
            </dt>
            <dd className="text-foreground leading-relaxed mt-0.5">{avoid}</dd>
          </div>
        </dl>
        <div className="rounded-lg bg-subtle px-3 py-2 text-xs text-foreground leading-relaxed">
          <span className="font-semibold">In Scaffold:</span>{" "}
          <span dangerouslySetInnerHTML={{ __html: inApp }} />
        </div>
      </div>
    </li>
  );
}

function Phase({
  n,
  label,
  state,
  body,
}: {
  n: number;
  label: string;
  state: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-soft border border-accent/30 text-accent-ink font-semibold flex items-center justify-center text-xs"
          >
            {n}
          </span>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider bg-subtle text-muted px-2 py-0.5 rounded">
          {state}
        </span>
      </div>
      <p className="text-xs text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function SampleActivity({
  name,
  body,
  goal,
}: {
  name: string;
  body: string;
  goal: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>
      <p className="text-xs text-muted leading-relaxed">{body}</p>
      <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mt-1">
        Goal
      </div>
      <p className="text-xs text-foreground leading-relaxed">{goal}</p>
    </div>
  );
}
