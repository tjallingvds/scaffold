"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function UserChip({
  name,
  email,
  initials,
  hasAuth,
}: {
  name: string;
  email: string;
  initials: string;
  hasAuth: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 relative">
      <button
        type="button"
        aria-label="Notifications"
        className="h-9 w-9 rounded-full bg-chrome-soft text-chrome-ink hover:bg-chrome-soft/80 flex items-center justify-center"
      >
        <span aria-hidden className="text-sm">
          ◔
        </span>
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full bg-chrome-soft pl-1 pr-3 py-1 hover:bg-chrome-soft/80 transition-colors"
      >
        <span
          aria-hidden
          className="h-7 w-7 rounded-full bg-gradient-to-br from-lilac to-accent-soft text-accent-ink text-xs font-semibold flex items-center justify-center"
        >
          {initials}
        </span>
        <span className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-medium text-chrome-ink max-w-[140px] truncate">
            {name}
          </span>
          <span className="text-[10px] text-chrome-muted max-w-[140px] truncate">
            {email}
          </span>
        </span>
      </button>
      {open && hasAuth && (
        <div className="absolute right-0 top-full mt-2 rounded-xl bg-surface border border-border shadow-xl p-2 z-50 min-w-[160px]">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left text-sm text-foreground hover:bg-subtle rounded-lg px-3 py-2"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
