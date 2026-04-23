"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const search = useSearchParams();
  const router = useRouter();
  const callbackUrl = search.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!res || res.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <div className="text-lg font-semibold text-foreground">Scaffold</div>
        <div className="text-sm text-muted">Sign in to your teacher account</div>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-4 rounded-3xl border border-border bg-surface shadow-sm p-6">
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none"
          />
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
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-muted text-center">
        Need an account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
