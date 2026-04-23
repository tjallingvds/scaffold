"use client";

import { useState } from "react";
import type { LessonRequest } from "@/lib/types";
import { Field, TextArea, TextInput } from "./Field";
import { Button } from "./PageFrame";
import { PIINotice } from "./PIINotice";

interface Props {
  onGenerate: (input: LessonRequest) => void;
  isLoading: boolean;
}

const SCOPE_OPTIONS: { value: LessonRequest["scope"]; label: string; hint: string }[] = [
  { value: "full_cycle", label: "Full three-phase cycle", hint: "Pre, guided, reflective" },
  { value: "pre_engagement", label: "Pre-engagement only", hint: "AI-off initial attempt" },
  { value: "guided_engagement", label: "Guided engagement only", hint: "Bounded AI use" },
  { value: "reflective_engagement", label: "Reflective engagement only", hint: "Open AI refinement" },
];

export function LessonInputs({ onGenerate, isLoading }: Props) {
  const [subject, setSubject] = useState("10th-grade biology");
  const [gradeLevel, setGradeLevel] = useState("10");
  const [concept, setConcept] = useState("Natural selection");
  const [objective, setObjective] = useState(
    "Students can explain how allele frequencies shift in a population under selection pressure."
  );
  const [time, setTime] = useState(75);
  const [scope, setScope] = useState<LessonRequest["scope"]>("full_cycle");
  const [considerations, setConsiderations] = useState(
    "Two students with ADHD; one ELL at intermediate level."
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate({
      subject: subject.trim(),
      grade_level: gradeLevel.trim(),
      concept: concept.trim(),
      learning_objective: objective.trim(),
      time_minutes: time,
      scope,
      special_considerations: considerations.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Subject">
        <TextInput
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </Field>

      <Field label="Grade level">
        <TextInput
          type="text"
          required
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
        />
      </Field>

      <Field label="Concept">
        <TextInput
          type="text"
          required
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />
      </Field>

      <Field label="Learning objective" hint="What should students be able to do?">
        <TextArea
          required
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          rows={3}
        />
      </Field>

      <Field label="Available class time (minutes)">
        <TextInput
          type="number"
          required
          min={5}
          max={300}
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Phase to design</legend>
        <div className="flex flex-col gap-2">
          {SCOPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 rounded border border-border bg-surface px-3 py-2 cursor-pointer hover:border-accent"
            >
              <input
                type="radio"
                name="scope"
                value={opt.value}
                checked={scope === opt.value}
                onChange={() => setScope(opt.value)}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-muted">{opt.hint}</div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Special considerations"
        hint="Neurodivergent profiles, ELL levels, accommodations. No student names or PII."
      >
        <TextArea
          value={considerations}
          onChange={(e) => setConsiderations(e.target.value)}
          rows={3}
        />
      </Field>

      <PIINotice text={`${subject} ${considerations} ${concept} ${objective}`} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Generating…" : "Generate lesson"}
      </Button>
    </form>
  );
}
