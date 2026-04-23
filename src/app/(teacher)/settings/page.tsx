"use client";

import { useState } from "react";
import { Button, PageFrame } from "../_components/PageFrame";
import { Field, TextInput } from "../_components/Field";

interface Prefs {
  default_subject: string;
  default_grade_level: string;
  default_district_context: string;
}

const STORAGE_KEY = "scaffold.prefs.v1";
const DEFAULTS: Prefs = {
  default_subject: "",
  default_grade_level: "",
  default_district_context: "",
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    setPrefs(DEFAULTS);
  }

  return (
    <PageFrame
      title="Settings"
      subtitle="Default context for new generations. Stored locally in your browser."
    >
      <div className="overflow-y-auto h-full">
        <div className="max-w-2xl mx-auto px-8 py-8 flex flex-col gap-8">
          <form onSubmit={save} className="flex flex-col gap-5">
            <h2 className="text-xs uppercase tracking-wider text-muted font-medium">
              Teacher context
            </h2>
            <Field label="Default subject">
              <TextInput
                value={prefs.default_subject}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, default_subject: e.target.value }))
                }
              />
            </Field>
            <Field label="Default grade level">
              <TextInput
                value={prefs.default_grade_level}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, default_grade_level: e.target.value }))
                }
              />
            </Field>
            <Field
              label="District or school context"
              hint="Any procurement or tooling constraints you want Scaffold to consider."
            >
              <TextInput
                value={prefs.default_district_context}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, default_district_context: e.target.value }))
                }
              />
            </Field>
            <div className="flex items-center gap-3">
              <Button type="submit">Save</Button>
              {saved && <span className="text-xs text-accent">Saved.</span>}
            </div>
          </form>

          <div className="border-t border-border pt-6 flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-wider text-muted font-medium">
              Privacy
            </h2>
            <div className="rounded border border-border bg-surface p-4 text-sm text-foreground/90 leading-relaxed flex flex-col gap-2">
              <p>
                <strong>No student data.</strong> Scaffold is a teacher tool. Inputs
                should never include student names, student IDs, IEP contents, or other
                identifying information.
              </p>
              <p>
                <strong>No content training.</strong> Generations are sent to the DeepSeek
                API configured in your <code>.env.local</code>. Scaffold does not store
                generated content on the server.
              </p>
              <p>
                <strong>Local-only preferences.</strong> The settings above live in your
                browser&rsquo;s <code>localStorage</code>. Clearing them below removes
                them from this device.
              </p>
            </div>
            <div>
              <Button variant="secondary" onClick={clearAll}>
                Clear all local preferences
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-wider text-muted font-medium">
              LLM
            </h2>
            <div className="rounded border border-border bg-surface p-4 text-sm text-foreground/90 leading-relaxed">
              Scaffold uses the DeepSeek API. Set{" "}
              <code>DEEPSEEK_API_KEY</code> and optionally{" "}
              <code>DEEPSEEK_MODEL</code> (default: <code>deepseek-chat</code>) in{" "}
              <code>.env.local</code>. Restart the dev server after changes.
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
