"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button, PageFrame } from "../_components/PageFrame";
import { Field, TextArea, TextInput } from "../_components/Field";
import { RecentList, useLibrary } from "../_components/Library";
import { RevisePrompt } from "../_components/RevisePrompt";
import { ExampleChips } from "../_components/ExampleChips";
import { SEMESTER_EXAMPLES } from "@/lib/templates/builder-examples";
import { WarningsPanel } from "../_components/WarningsPanel";
import { ASSIGNMENT_TEMPLATES } from "@/lib/templates/assignments";
import type { SemesterPlan, SemesterRequest } from "@/lib/types";

export default function SemesterPage() {
  const [courseTitle, setCourseTitle] = useState("AP US History");
  const [subject, setSubject] = useState("History");
  const [gradeLevel, setGradeLevel] = useState("11");
  const [weeks, setWeeks] = useState(16);
  const [outline, setOutline] = useState(
    [
      "Unit 1: Colonial foundations to 1763",
      "Unit 2: Revolution and Constitution",
      "Unit 3: Jacksonian democracy",
      "Unit 4: Slavery, sectionalism, and Civil War",
      "Unit 5: Reconstruction and the Gilded Age",
    ].join("\n")
  );
  const [plan, setPlan] = useState<SemesterPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const library = useLibrary("semester");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const body: SemesterRequest = {
      course_title: courseTitle.trim(),
      subject: subject.trim(),
      grade_level: gradeLevel.trim(),
      total_weeks: weeks,
      units_outline: outline.trim(),
    };
    try {
      const res = await fetch("/api/semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      const next = data.plan as SemesterPlan;
      setPlan(next);
      library.save(courseTitle.trim() || "Semester plan", {
        request: body,
        plan: next,
      });
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageFrame title="Plan a semester">
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8">
          {library.entries.length > 0 && !plan && (
            <RecentList
              entries={library.entries}
              onPick={(entry) => {
                const d = entry.data as {
                  request: SemesterRequest;
                  plan: SemesterPlan;
                };
                setCourseTitle(d.request.course_title);
                setSubject(d.request.subject);
                setGradeLevel(d.request.grade_level);
                setWeeks(d.request.total_weeks);
                setOutline(d.request.units_outline);
                setPlan(d.plan);
                setTimeout(
                  () =>
                    resultRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    }),
                  80,
                );
              }}
              onRemove={library.remove}
            />
          )}
          <form onSubmit={submit} className="flex flex-col gap-6">
            <ExampleChips
              examples={SEMESTER_EXAMPLES}
              onPick={(ex) => {
                setCourseTitle(ex.course_title);
                setSubject(ex.subject);
                setGradeLevel(ex.grade_level);
                setWeeks(ex.total_weeks);
                setOutline(ex.units_outline);
                setPlan(null);
              }}
            />
            <Field label="Course title">
              <TextInput
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Subject">
                <TextInput
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Field>
              <Field label="Grade level">
                <TextInput
                  required
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
              </Field>
              <Field label="Weeks">
                <TextInput
                  type="number"
                  required
                  min={4}
                  max={52}
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                />
              </Field>
            </div>

            <Field label="Units outline" hint="One unit per line is fine.">
              <TextArea
                required
                rows={8}
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
              />
            </Field>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Planning…" : plan ? "Regenerate" : "Generate semester plan"}
              </Button>
              {isLoading && (
                <span className="text-xs text-muted">Usually 15–25 seconds.</span>
              )}
              {error && <span className="text-xs text-error">{error}</span>}
            </div>
          </form>

          <div ref={resultRef} />

          {plan && (
            <div className="border-t border-border pt-8 flex flex-col gap-6">
              <RevisePrompt
                kind="semester"
                current={plan as unknown as Record<string, unknown>}
                onRevised={(next) => setPlan(next as unknown as SemesterPlan)}
                quickActions={[
                  "Use more variety across templates",
                  "Add a Break-the-AI assignment somewhere",
                  "Split the longest unit into two",
                ]}
              />
              <header>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {plan.course_title}
                </h2>
                <p className="text-sm text-muted mt-1">{plan.total_weeks} weeks</p>
              </header>

              <ol className="flex flex-col gap-3">
                {plan.units.map((u, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-border bg-surface overflow-hidden"
                  >
                    <header className="border-b border-border px-4 py-3 flex items-baseline justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {u.unit_title}
                        </div>
                        <div className="text-xs text-muted">
                          Weeks {u.week_start}–{u.week_end}
                        </div>
                      </div>
                    </header>
                    <div className="px-4 py-4 flex flex-col gap-3">
                      <div>
                        <div className="text-xs text-muted font-medium mb-1">
                          Learning objectives
                        </div>
                        <ul className="list-disc pl-5 text-sm flex flex-col gap-0.5 text-foreground/90">
                          {u.learning_objectives.map((lo, j) => (
                            <li key={j}>{lo}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs text-muted font-medium mb-1.5">
                          Recommended assignment templates
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {u.recommended_templates.map((t, j) => {
                            const meta = ASSIGNMENT_TEMPLATES.find((x) => x.id === t);
                            return (
                              <Link
                                key={j}
                                href={`/assignment`}
                                className="text-xs bg-subtle text-foreground px-2 py-0.5 rounded-full hover:bg-foreground hover:text-surface transition-colors"
                              >
                                {meta?.name ?? t}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-sm text-foreground/80 border-t border-border pt-3">
                        {u.rationale}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {plan.variety_notes && (
                <section className="border-t border-border pt-5">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Variety across the semester
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {plan.variety_notes}
                  </p>
                </section>
              )}

              {(plan.framework_warnings?.length ?? 0) > 0 && (
                <WarningsPanel warnings={plan.framework_warnings} />
              )}
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
