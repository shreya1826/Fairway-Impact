import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("charities").select("*").order("featured", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ charities: data });
}

// user updates their own charity selection / contribution percent
export async function PUT(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { charity_id, charity_percent } = await request.json();
  if (charity_percent < 10) {
    return NextResponse.json({ error: "Minimum contribution is 10%." }, { status: 400 });
  }
  const { error } = await supabase.from("profiles").update({ charity_id, charity_percent }).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
