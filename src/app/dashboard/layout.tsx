import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold">Fairway <span className="text-coral italic">Impact</span></Link>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-coral">Overview</Link>
            <Link href="/dashboard/scores" className="hover:text-coral">Scores</Link>
            <Link href="/dashboard/charity" className="hover:text-coral">Charity</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
