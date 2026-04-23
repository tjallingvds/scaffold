// Student-facing pages bypass the teacher AppShell entirely.
// This nested layout replaces the parent layout's chrome.
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
