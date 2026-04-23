"use client";

import { ReactNode } from "react";

export function PageFrame({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-surface">
      <header className="px-6 lg:px-10 pt-8 pb-4 flex items-end justify-between flex-shrink-0 gap-4 border-b border-border">
        <div>
          <h1 className="font-display text-2xl md:text-[1.9rem] text-foreground leading-[1.1]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted mt-1.5 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export function ThreePanel({
  left,
  center,
  right,
}: {
  left: ReactNode;
  center: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div
      className={`grid h-full min-h-0 border-t border-border ${
        right ? "grid-cols-[320px_1fr_280px]" : "grid-cols-[320px_1fr]"
      }`}
    >
      <section className="border-r border-border bg-surface overflow-y-auto px-6 py-6">
        {left}
      </section>
      <section className="overflow-y-auto relative bg-surface">{center}</section>
      {right && (
        <section className="border-l border-border bg-surface overflow-y-auto px-5 py-6">
          {right}
        </section>
      )}
    </div>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full items-center justify-center text-muted text-sm px-8 text-center">
      <div>
        <p className="text-foreground font-medium mb-2">{title}</p>
        <p>{body}</p>
      </div>
    </div>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-muted text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 border-2 border-border border-t-accent rounded-full animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const base =
    "rounded-full px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-foreground text-surface hover:opacity-90 shadow-sm"
      : "border border-border bg-surface text-foreground hover:border-foreground";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
