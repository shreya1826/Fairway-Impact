import { createClient } from "@/lib/supabase/server";

export default async function DashboardHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subscription }, { data: scores }, { data: entries }, { data: winners }] = await Promise.all([
    supabase.from("profiles").select("*, charities(name)").eq("id", user!.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("scores").select("*").eq("user_id", user!.id),
    supabase.from("draw_entries").select("*, draws(month, year, status)").eq("user_id", user!.id),
    supabase.from("winners").select("*").eq("user_id", user!.id)
  ]);

  const totalWon = (winners ?? []).reduce((sum, w) => sum + Number(w.prize_amount), 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Subscription</p>
        <p className="mt-2 font-display text-2xl font-semibold capitalize">
          {subscription?.status === "active" ? "Active" : "Inactive"}
        </p>
        {subscription?.current_period_end && (
          <p className="mt-1 text-sm text-ink/60">Renews {new Date(subscription.current_period_end).toLocaleDateString()}</p>
        )}
        {subscription?.status !== "active" && (
          <a href="/pricing" className="mt-4 inline-block text-sm font-semibold text-coral">Subscribe →</a>
        )}
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Your charity</p>
        <p className="mt-2 font-display text-2xl font-semibold">{(profile as any)?.charities?.name || "Not selected"}</p>
        <p className="mt-1 text-sm text-ink/60">{profile?.charity_percent ?? 10}% of your subscription</p>
        <a href="/dashboard/charity" className="mt-4 inline-block text-sm font-semibold text-coral">Change →</a>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Scores on file</p>
        <p className="mt-2 font-display text-2xl font-semibold">{scores?.length ?? 0} / 5</p>
        <a href="/dashboard/scores" className="mt-4 inline-block text-sm font-semibold text-coral">Manage scores →</a>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Winnings</p>
        <p className="mt-2 font-display text-2xl font-semibold">${totalWon.toFixed(2)}</p>
        <p className="mt-1 text-sm text-ink/60">{entries?.length ?? 0} draws entered</p>
      </div>
    </div>
  );
}
