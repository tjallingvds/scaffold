"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Sign-up failed (${res.status})`);
        return;
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!signInRes || signInRes.error) {
        setError("Account created, but automatic sign-in failed. Try logging in.");
        router.push("/login");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <div className="text-lg font-semibold text-foreground">Scaffold</div>
        <div className="text-sm text-muted">Create a teacher account</div>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-4 rounded-3xl border border-border bg-surface shadow-sm p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Display name (optional)</span>
          <input
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none"
          />
          <span className="text-xs text-muted">At least 8 characters.</span>
        </label>

        {error && (
          <div role="alert" className="text-sm text-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-foreground text-surface px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-muted text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
