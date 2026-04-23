"use client";

import { useRef, useState } from "react";
import { Button, PageFrame } from "../_components/PageFrame";
import { Field, TextArea, TextInput } from "../_components/Field";
import { POLICY_TEMPLATES } from "@/lib/templates/policies";
import type { PolicyDocument, PolicyRequest, PolicyTemplateId } from "@/lib/types";

export default function PolicyPage() {
  const [template, setTemplate] = useState<PolicyTemplateId>("three_phase");
  const [courseTitle, setCourseTitle] = useState("English 11 - American Literature");
  const [subject, setSubject] = useState("English / Literature");
  const [gradeLevel, setGradeLevel] = useState("11");
  const [outcomes, setOutcomes] = useState(
    "Close reading of American novels, argumentative writing with textual evidence, presentation of an independent literary analysis."
  );
  const [assessments, setAssessments] = useState(
    "Two major essays, a midterm close-reading exam, a final research project."
  );
  const [doc, setDoc] = useState<PolicyDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const body: PolicyRequest = {
      template,
      subject: subject.trim(),
      grade_level: gradeLevel.trim(),
      course_title: courseTitle.trim(),
      key_learning_outcomes: outcomes.trim(),
      assessment_types: assessments.trim() || undefined,
    };
    try {
      const res = await fetch("/api/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      setDoc(data.doc as PolicyDocument);
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
    <PageFrame title="New classroom AI policy">
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8">
          <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Template</label>
              <div className="flex flex-wrap gap-1.5">
                {POLICY_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                      template === t.id
                        ? "bg-foreground text-surface border-foreground"
                        : "bg-surface text-foreground border-border hover:border-foreground"
                    }`}
                    title={t.best_for}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {POLICY_TEMPLATES.find((t) => t.id === template)?.best_for}
              </p>
            </div>

            <Field label="Course title">
              <TextInput
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <Field label="Key learning outcomes">
              <TextArea
                required
                rows={3}
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
              />
            </Field>

            <details>
              <summary className="text-sm text-muted cursor-pointer hover:text-foreground">
                Optional: assessment types in this course
              </summary>
              <div className="mt-2">
                <TextArea
                  rows={3}
                  value={assessments}
                  onChange={(e) => setAssessments(e.target.value)}
                />
              </div>
            </details>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Writing…" : doc ? "Regenerate" : "Generate policy"}
              </Button>
              {isLoading && (
                <span className="text-xs text-muted">Usually 10–20 seconds.</span>
              )}
              {error && <span className="text-xs text-error">{error}</span>}
            </div>
          </form>

          <div ref={resultRef} />

          {doc && (
            <div className="border-t border-border pt-8 flex flex-col gap-8">
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Syllabus statement
                  </h3>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(doc.syllabus_statement);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-xs text-foreground hover:underline"
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {doc.syllabus_statement}
                </p>
              </section>

              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Day-one discussion guide
                </h3>
                <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-foreground">
                  {doc.day_one_discussion_guide.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </section>

              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">Student FAQ</h3>
                <div className="flex flex-col gap-3">
                  {doc.student_faq.map((item, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-surface p-4">
                      <div className="text-sm font-medium text-foreground">
                        {item.question}
                      </div>
                      <div className="text-sm text-foreground/80 mt-1">{item.answer}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
