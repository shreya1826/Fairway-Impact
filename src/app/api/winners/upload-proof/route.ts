import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Client uploads the file directly to Supabase Storage (bucket: winner-proofs,
// path: `${user.id}/${winnerId}.png`) using the browser Supabase client, then
// calls this route with the resulting public/signed URL to attach it to the winner row.
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { winner_id, proof_url } = await request.json();
  const { error } = await supabase
    .from("winners")
    .update({ proof_url })
    .eq("id", winner_id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
