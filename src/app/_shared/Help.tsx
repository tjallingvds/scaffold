"use client";

import { useEffect, useRef, useState } from "react";

export function Help({
  label = "What is this?",
  children,
  align = "left",
}: {
  label?: string;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-block align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={label}
        aria-expanded={open}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-border bg-surface text-muted hover:text-foreground hover:border-foreground text-[10px] font-semibold ml-1.5 align-middle cursor-help"
      >
        ?
      </button>
      {open && (
        <span
          role="dialog"
          className={`absolute z-50 top-full ${
            align === "right" ? "right-0" : "left-0"
          } mt-1.5 w-72 rounded-xl bg-surface border border-border shadow-xl p-3 text-xs text-foreground leading-relaxed normal-case tracking-normal font-normal text-left`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
