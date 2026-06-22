import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const { draw_id } = await request.json();
  const admin = createAdminClient();

  const { data: draw, error } = await admin
    .from("draws").update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", draw_id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const monthLabel = new Date(draw.year, draw.month - 1).toLocaleString("default", { month: "long", year: "numeric" });

  const { data: entrants } = await admin.from("draw_entries").select("user_id").eq("draw_id", draw_id);
  const { data: winners } = await admin.from("winners").select("user_id, tier, prize_amount").eq("draw_id", draw_id);

  for (const entrant of entrants ?? []) {
    const { data: u } = await admin.auth.admin.getUserById(entrant.user_id);
    if (u?.user?.email) {
      const tpl = emailTemplates.drawPublished(monthLabel, draw.winning_numbers);
      await sendEmail(u.user.email, tpl.subject, tpl.html);
    }
  }
  for (const w of winners ?? []) {
    const { data: u } = await admin.auth.admin.getUserById(w.user_id);
    if (u?.user?.email) {
      const tpl = emailTemplates.winnerNotice(w.tier, Number(w.prize_amount));
      await sendEmail(u.user.email, tpl.subject, tpl.html);
    }
  }

  return NextResponse.json({ ok: true, draw });
}
