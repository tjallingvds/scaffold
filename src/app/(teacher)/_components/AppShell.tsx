import { Nav } from "./Nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="bg-chrome text-chrome-ink sticky top-0 z-50">
        <div className="px-5 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <Logo />
          <div className="hidden md:block">
            <Nav />
          </div>
          <div className="w-[80px]" aria-hidden />
        </div>
        <div className="md:hidden border-t border-chrome-soft px-4 py-2 overflow-x-auto">
          <Nav />
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden bg-surface">{children}</main>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-accent-ink text-white text-xs font-bold"
      >
        S
      </span>
      <span className="font-display text-[1.15rem] text-chrome-ink leading-none">
        Scaffold
      </span>
    </div>
  );
}

