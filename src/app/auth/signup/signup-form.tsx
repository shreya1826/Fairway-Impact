"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-medium">Check your inbox</h1>
        <p className="mt-3 text-sm text-ink/70">We sent a confirmation link to {email}. Click it, then come back to log in.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-medium">Create your account</h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="focus-ring rounded-lg border border-ink/15 px-4 py-2.5" />
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="focus-ring rounded-lg border border-ink/15 px-4 py-2.5" />
        <input type="password" required minLength={6} placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="focus-ring rounded-lg border border-ink/15 px-4 py-2.5" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="focus-ring rounded-full bg-ink py-2.5 font-semibold text-cream disabled:opacity-60">
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/60">Already have an account? <Link href="/auth/login" className="font-semibold text-coral">Sign in</Link></p>
    </main>
  );
}
