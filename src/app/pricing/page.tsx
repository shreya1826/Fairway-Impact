import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SubscribeButton from "@/components/SubscribeButton";

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">Pricing</p>
          <h1 className="mt-3 font-display text-4xl font-medium">One subscription. Three ways it pays off.</h1>
          <p className="mt-3 text-ink/70">You play, you might win, and your charity always wins.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-white p-8">
            <h2 className="font-display text-2xl font-semibold">Monthly</h2>
            <p className="mt-2 text-3xl font-semibold">$9<span className="text-base font-normal text-ink/50">/mo</span></p>
            <ul className="mt-6 space-y-2 text-sm text-ink/70">
              <li>• Score tracking &amp; monthly draw entry</li>
              <li>• 10%+ goes to your chosen charity</li>
              <li>• Cancel anytime</li>
            </ul>
            <div className="mt-8">
              <SubscribeButton
                priceId={process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "monthly"}
                label="Subscribe Monthly"
              />
            </div>
          </div>
          <div className="rounded-2xl border-2 border-coral bg-white p-8">
            <h2 className="font-display text-2xl font-semibold">Yearly <span className="text-sm font-normal text-coral">Best value</span></h2>
            <p className="mt-2 text-3xl font-semibold">$89<span className="text-base font-normal text-ink/50">/yr</span></p>
            <ul className="mt-6 space-y-2 text-sm text-ink/70">
              <li>• Everything in Monthly</li>
              <li>• ~2 months free vs. paying monthly</li>
              <li>• Locked-in rate for the year</li>
            </ul>
            <div className="mt-8">
              <SubscribeButton
                priceId={process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || "yearly"}
                label="Subscribe Yearly"
              />
            </div>          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
