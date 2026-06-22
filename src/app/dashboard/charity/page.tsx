"use client";
import { useEffect, useState } from "react";
import type { Charity } from "@/types/database";

export default function CharitySelectPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selected, setSelected] = useState("");
  const [percent, setPercent] = useState(10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/charities").then((r) => r.json()).then((d) => setCharities(d.charities ?? []));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/charities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ charity_id: selected, charity_percent: percent })
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-medium">Choose your charity</h1>
      <p className="mt-2 text-sm text-ink/60">At least 10% of your subscription goes to whoever you select. Increase it anytime.</p>

      <div className="mt-6 flex flex-col gap-2">
        {charities.map((c) => (
          <label key={c.id} className={`cursor-pointer rounded-xl border p-4 ${selected === c.id ? "border-coral bg-coral/5" : "border-ink/10 bg-white"}`}>
            <input type="radio" name="charity" value={c.id} checked={selected === c.id} onChange={() => setSelected(c.id)} className="mr-3" />
            <span className="font-semibold">{c.name}</span>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <label className="text-xs font-medium uppercase tracking-wide text-ink/50">Contribution %</label>
        <input type="range" min={10} max={100} value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="mt-2 w-full" />
        <p className="mt-1 text-sm font-semibold text-coral">{percent}%</p>
      </div>

      <button onClick={handleSave} disabled={!selected || saving} className="focus-ring mt-6 rounded-full bg-ink px-6 py-2.5 font-semibold text-cream disabled:opacity-50">
        {saving ? "Saving…" : "Save selection"}
      </button>
      {saved && <p className="mt-2 text-sm text-moss">Saved.</p>}
    </div>
  );
}
