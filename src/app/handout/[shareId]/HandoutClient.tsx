"use client";

import { QRCodeSVG } from "qrcode.react";
import type { AssignmentPlan } from "@/lib/types";

export function HandoutClient({
  plan,
  url,
  shareId,
}: {
  plan: AssignmentPlan;
  url: string;
  shareId: string;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 0.75in; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 py-10 print:py-0 flex flex-col gap-8">
        <div className="no-print flex items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="text-sm text-muted">
            Hand this out, project it, or print it.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-foreground text-surface px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Print
            </button>
            <button
              type="button"
              onClick={() => window.close()}
              className="rounded-full border border-border bg-surface text-foreground px-4 py-2 text-sm font-medium hover:border-foreground"
            >
              Close
            </button>
          </div>
        </div>

        <header className="flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
            Assignment
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground leading-[1.1]">
            {plan.title}
          </h1>
          <div className="text-sm text-muted">
            Grade {plan.grade_level} · about {plan.time_minutes} minutes
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-subtle p-5 flex items-center gap-5">
          <div className="rounded-xl bg-surface border border-border p-3 flex-shrink-0">
            <QRCodeSVG
              value={url}
              size={160}
              bgColor="transparent"
              fgColor="currentColor"
              level="M"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold">
              Open it here
            </div>
            <div className="text-base font-mono text-foreground break-all mt-1">
              {url}
            </div>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              Scan the QR code with your phone camera, or type the URL into any
              browser. No account needed.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-foreground">
            What you&rsquo;ll do
          </h2>
          <ol className="flex flex-col gap-2 pl-5 list-decimal text-sm text-foreground">
            <li>
              <strong>Think for yourself first.</strong> Answer three short
              questions about what you already know, what&rsquo;s confusing, and
              what you&rsquo;ve tried. No AI yet.
            </li>
            <li>
              <strong>Write your draft. Then talk to an AI tutor about it.</strong>{" "}
              The tutor is built to ask questions, not give answers. It answers
              factual questions but pushes back on thinking questions.
            </li>
            <li>
              <strong>Reflect.</strong> Three short questions about what changed,
              what you took or rejected from the AI, and what you&rsquo;re still
              unsure about.
            </li>
            <li>
              <strong>Submit</strong> to your teacher at the end.
            </li>
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-foreground">
            If you work in a pair or small group
          </h2>
          <p className="text-sm text-foreground leading-relaxed">
            You can work together on one device. On the welcome screen there is
            a box to enter your names or group label so your teacher can tell
            submissions apart. Still talk to the tutor out loud; both of you
            should be thinking.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-foreground">
            If you get stuck
          </h2>
          <ul className="flex flex-col gap-1.5 pl-5 list-disc text-sm text-foreground">
            <li>
              The <strong>♿ button</strong> in the top right adapts the page to
              different needs (bigger text, dyslexia-friendly font, focus mode,
              simpler tutor language).
            </li>
            <li>
              <strong>Read aloud</strong> is built into every step. Tap the play
              icon next to the task.
            </li>
            <li>
              If the AI tutor refuses to answer something, that&rsquo;s on
              purpose. Write down your best guess and come back to it.
            </li>
          </ul>
        </section>

        <footer className="text-xs text-muted border-t border-border pt-4">
          Scaffold does not ask for your name, email, or any other personal
          information. Your work is sent to your teacher&rsquo;s inbox only,
          and only for this assignment.
          <span className="block mt-1 font-mono opacity-60">#{shareId}</span>
        </footer>
      </div>
    </div>
  );
}
