"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Fairway <span className="text-coral italic">Impact</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/charities" className="hover:text-coral">Charities</Link>
          <Link href="/pricing" className="hover:text-coral">Pricing</Link>
          {user && <Link href="/dashboard" className="hover:text-coral">Dashboard</Link>}
        </div>
        {user ? (
          <button
            onClick={handleLogout}
            className="rounded-full border border-ink px-5 py-2 text-sm font-semibold transition hover:bg-ink hover:text-cream"
          >
            Log out
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-semibold hover:text-coral">
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-coral"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}