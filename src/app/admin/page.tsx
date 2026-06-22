import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = createClient();
  const [{ count: userCount }, { data: winners }, { data: profiles }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("winners").select("prize_amount"),
    supabase.from("profiles").select("charity_percent")
  ]);

  const totalPrizesPaid = (winners ?? []).reduce((s, w) => s + Number(w.prize_amount), 0);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Stat label="Total users" value={String(userCount ?? 0)} />
      <Stat label="Total won (all time)" value={`$${totalPrizesPaid.toFixed(2)}`} />
      <Stat label="Avg. charity %" value={`${profiles?.length ? (profiles.reduce((s, p) => s + Number(p.charity_percent), 0) / profiles.length).toFixed(1) : 0}%`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cream/10 bg-cream/5 p-6">
      <p className="text-xs uppercase tracking-wide text-cream/50">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
