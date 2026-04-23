"use client";

import { useEffect, useState } from "react";

export function SpeakButton({
  text,
  label = "Read aloud",
}: {
  text: string;
  label?: string;
}) {
  // Detect availability synchronously at render time; undefined on the server.
  const available =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!available || !text?.trim()) return null;

  function play() {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utter);
  }

  function stop() {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <button
      type="button"
      onClick={speaking ? stop : play}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface text-foreground px-2.5 py-1 text-xs font-medium hover:border-foreground transition-colors"
      aria-label={speaking ? "Stop reading" : label}
    >
      <span aria-hidden>{speaking ? "■" : "▶"}</span>
      <span>{speaking ? "Stop" : label}</span>
    </button>
  );
}
