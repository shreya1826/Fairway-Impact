"use client";
import { useState } from "react";

export default function SubscribeButton({ plan }: { plan: "monthly" | "yearly" }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Something went wrong starting checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="focus-ring w-full rounded-full bg-ink py-3 font-semibold text-cream transition hover:bg-coral disabled:opacity-60"
    >
      {loading ? "Redirecting…" : `Subscribe ${plan === "monthly" ? "Monthly" : "Yearly"}`}
    </button>
  );
}
