"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SubscribeButton({ priceId, label }: { priceId: string; label: string }) {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/signup");
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <button
      onClick={handleClick}
      className="focus-ring w-full rounded-full bg-ink py-3 font-semibold text-cream transition hover:bg-coral"
    >
      {label}
    </button>
  );
}