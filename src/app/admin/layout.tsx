import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/admin" className="font-display text-lg font-semibold">Fairway Impact <span className="text-gold">Admin</span></Link>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/admin/users" className="hover:text-coral">Users</Link>
            <Link href="/admin/draws" className="hover:text-coral">Draws</Link>
            <Link href="/admin/charities" className="hover:text-coral">Charities</Link>
            <Link href="/admin/winners" className="hover:text-coral">Winners</Link>
            <Link href="/dashboard" className="text-cream/50 hover:text-cream">Exit admin</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
