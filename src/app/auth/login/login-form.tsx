"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push(params.get("redirect") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-medium">Welcome back</h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="focus-ring rounded-lg border border-ink/15 px-4 py-2.5" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="focus-ring rounded-lg border border-ink/15 px-4 py-2.5" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="focus-ring rounded-full bg-ink py-2.5 font-semibold text-cream disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/60">No account? <Link href="/auth/signup" className="font-semibold text-coral">Sign up</Link></p>
    </main>
  );
}
