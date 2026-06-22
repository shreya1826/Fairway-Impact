import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateRandomDraw, generateAlgorithmicDraw, scoreMatchTier } from "@/lib/drawEngine";
import { calculatePoolTiers, splitAmongWinners } from "@/lib/prizePool";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const admin = createAdminClient();
  const { data: draws } = await admin.from("draws").select("*").order("year", { ascending: false }).order("month", { ascending: false });
  return NextResponse.json({ draws });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const { draw_type, revenue_pool } = await request.json();
  const admin = createAdminClient();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // rollover carried from the most recently published draw, if its jackpot went unclaimed
  const { data: lastPublished } = await admin
    .from("draws").select("jackpot_rollover")
    .eq("status", "published").order("year", { ascending: false }).order("month", { ascending: false })
    .limit(1).maybeSingle();
  const previousRollover = lastPublished?.jackpot_rollover ?? 0;

  // every active subscriber's current (up to 5) scores become their draw numbers
  const { data: activeSubs } = await admin.from("subscriptions").select("user_id").eq("status", "active");
  const userIds: string[] = [...new Set<string>((activeSubs ?? []).map((s: any) => s.user_id as string))];

  const entries: { userId: string; numbers: number[] }[] = [];
  for (const userId of userIds) {
    const { data: scores } = await admin.from("scores").select("score").eq("user_id", userId).order("played_on", { ascending: false }).limit(5);
    if (Array.isArray(scores) && scores.length === 5) {
      const scoreArray = scores as { score: number }[];
      entries.push({ userId, numbers: scoreArray.map((s) => s.score) });
    }
  }

  const winningNumbers = draw_type === "algorithmic"
    ? generateAlgorithmicDraw(entries.map((e) => ({ userId: e.userId, numbers: e.numbers })), "frequent")
    : generateRandomDraw();

  const pool = calculatePoolTiers(Number(revenue_pool) || 0, previousRollover);

  const tierCounts: Record<3 | 4 | 5, number> = { 3: 0, 4: 0, 5: 0 };
  const matched: { userId: string; tier: 3 | 4 | 5; numbers: number[] }[] = [];
  for (const e of entries) {
    const tier = scoreMatchTier(e.numbers, winningNumbers);
    if (tier) { tierCounts[tier]++; matched.push({ userId: e.userId, tier, numbers: e.numbers }); }
  }

  const { data: draw, error: drawError } = await admin
    .from("draws")
    .upsert({
      month, year, draw_type: draw_type || "random", status: "simulated",
      winning_numbers: winningNumbers, prize_pool_total: pool.total,
      jackpot_rollover: tierCounts[5] === 0 ? pool[5] : 0
    }, { onConflict: "month,year" })
    .select().single();

  if (drawError) return NextResponse.json({ error: drawError.message }, { status: 500 });

  // replace any prior simulated entries/winners for this draw, then re-insert
  await admin.from("draw_entries").delete().eq("draw_id", draw.id);
  await admin.from("winners").delete().eq("draw_id", draw.id);

  if (entries.length) {
    await admin.from("draw_entries").insert(
      entries.map((e) => ({
        draw_id: draw.id, user_id: e.userId, numbers: e.numbers,
        match_tier: scoreMatchTier(e.numbers, winningNumbers)
      }))
    );
  }
  if (matched.length) {
    await admin.from("winners").insert(
      matched.map((m) => ({
        draw_id: draw.id, user_id: m.userId, tier: m.tier,
        prize_amount: splitAmongWinners(pool[m.tier], tierCounts[m.tier]), status: "pending"
      }))
    );
  }

  return NextResponse.json({ draw, pool, winnerCounts: { ...tierCounts, total: matched.length } });
}
