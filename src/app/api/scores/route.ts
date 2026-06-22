import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("played_on", { ascending: false }); // "most recent first"

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scores: data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { score, played_on } = await request.json();
  if (!score || score < 1 || score > 45) {
    return NextResponse.json({ error: "Score must be between 1 and 45." }, { status: 400 });
  }
  if (!played_on) {
    return NextResponse.json({ error: "A date is required." }, { status: 400 });
  }

  // "An existing score entry for a date may only be edited or deleted" — so duplicate
  // dates upsert instead of erroring twice.
  const { error } = await supabase
    .from("scores")
    .upsert({ user_id: user.id, score, played_on }, { onConflict: "user_id,played_on" });

  // The rolling-5 trigger in the DB automatically retires the oldest score beyond 5.
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("scores").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
