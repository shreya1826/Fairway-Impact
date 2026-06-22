import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO — signature ripple motif: a single score ripples outward into impact */}
        <section className="relative overflow-hidden px-6 pt-20 pb-28">
          <div className="ripple-ring h-[420px] w-[420px] -right-32 -top-32" />
          <div className="ripple-ring h-[600px] w-[600px] -right-56 -top-56 opacity-60" />
          <div className="ripple-ring h-[800px] w-[800px] -right-80 -top-80 opacity-30" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">Play. Win. Give.</p>
            <h1 className="mt-5 font-display text-5xl font-medium leading-[1.05] md:text-6xl">
              Your round of golf, <em className="italic text-coral">turned into</em> someone's better day.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink/70">
              Log your Stableford scores, enter the monthly draw, and a share of every
              subscription goes straight to the charity you choose. No clubhouse required.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/pricing" className="focus-ring rounded-full bg-ink px-7 py-3 font-semibold text-cream transition hover:bg-coral">
                Start your subscription
              </Link>
              <Link href="/charities" className="focus-ring rounded-full border border-ink/20 px-7 py-3 font-semibold text-ink transition hover:border-coral hover:text-coral">
                See the charities
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y border-ink/10 bg-white px-6 py-16">
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
            <div>
              <span className="number-ball">1</span>
              <h3 className="mt-4 font-display text-xl font-semibold">Log your score</h3>
              <p className="mt-2 text-sm text-ink/70">Enter your last 5 Stableford rounds. We keep them current — the newest replaces the oldest.</p>
            </div>
            <div>
              <span className="number-ball">2</span>
              <h3 className="mt-4 font-display text-xl font-semibold">Enter the draw</h3>
              <p className="mt-2 text-sm text-ink/70">Every month we draw 5 numbers. Match 3, 4, or all 5 and you share in that tier's prize pool.</p>
            </div>
            <div>
              <span className="number-ball">3</span>
              <h3 className="mt-4 font-display text-xl font-semibold">Fund your cause</h3>
              <p className="mt-2 text-sm text-ink/70">A portion of every subscription — at least 10%, more if you choose — goes directly to your selected charity.</p>
            </div>
          </div>
        </section>

        {/* IMPACT STRIP */}
        <section className="px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss">Where it goes</p>
          <h2 className="mt-3 font-display text-3xl font-medium">40% jackpot. 35% runners-up. 25% steady winners. 100% real impact.</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">
            The 5-match jackpot rolls over if nobody claims it — so the pot you're playing for keeps growing.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
