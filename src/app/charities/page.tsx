export const dynamic = "force-dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CharityCard from "@/components/CharityCard";
import { createClient } from "@/lib/supabase/server";

export default async function CharitiesPage() {
  const supabase = createClient();
  const { data: charities } = await supabase.from("charities").select("*").order("featured", { ascending: false });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss">The cause behind the game</p>
        <h1 className="mt-3 font-display text-4xl font-medium">Choose who your subscription supports.</h1>
        <p className="mt-3 max-w-xl text-ink/70">Every charity below is currently receiving contributions from active subscribers. Pick one when you subscribe — you can change it anytime from your dashboard.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(charities ?? []).map((c) => <CharityCard key={c.id} charity={c} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}
