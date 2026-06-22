"use client";
import { useEffect, useState } from "react";

export default function AdminDraws() {
  const [draws, setDraws] = useState<any[]>([]);
  const [drawType, setDrawType] = useState<"random" | "algorithmic">("random");
  const [revenuePool, setRevenuePool] = useState(5000);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/draws/run");
    const data = await res.json();
    setDraws(data.draws ?? []);
  }
  useEffect(() => { load(); }, []);

  async function handleSimulate() {
    setLoading(true);
    const res = await fetch("/api/draws/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draw_type: drawType, revenue_pool: revenuePool })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    load();
  }

  async function handlePublish(drawId: string) {
    await fetch("/api/draws/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draw_id: drawId })
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-medium">Draws</h1>

      <div className="mt-6 rounded-2xl border border-cream/10 bg-cream/5 p-5">
        <h2 className="font-semibold">Run this month's draw</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-cream/50">Draw logic</label>
            <select value={drawType} onChange={(e) => setDrawType(e.target.value as any)} className="mt-1 rounded-lg bg-cream/10 px-3 py-2">
              <option value="random">Random (standard lottery-style)</option>
              <option value="algorithmic">Algorithmic (weighted by score frequency)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-cream/50">Subscription revenue allocated to prizes ($)</label>
            <input type="number" value={revenuePool} onChange={(e) => setRevenuePool(Number(e.target.value))} className="mt-1 w-40 rounded-lg bg-cream/10 px-3 py-2" />
          </div>
          <button onClick={handleSimulate} disabled={loading} className="rounded-full bg-coral px-5 py-2 font-semibold text-white disabled:opacity-60">
            {loading ? "Running…" : "Simulate draw"}
          </button>
        </div>
        {result && (
          <div className="mt-5 rounded-xl bg-cream/10 p-4">
            <p className="text-sm text-cream/60">Winning numbers (status: simulated — not yet visible to users)</p>
            <div className="mt-2 flex gap-2">
              {result.draw?.winning_numbers?.map((n: number) => <span key={n} className="number-ball">{n}</span>)}
            </div>
            <p className="mt-3 text-sm text-cream/70">
              Pool — 5-match: ${result.pool?.[5]?.toFixed(2)} · 4-match: ${result.pool?.[4]?.toFixed(2)} · 3-match: ${result.pool?.[3]?.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-cream/70">Winners found: {result.winnerCounts?.total ?? 0}</p>
          </div>
        )}
      </div>

      <ul className="mt-6 divide-y divide-cream/10 rounded-2xl border border-cream/10">
        {draws.map((d) => (
          <li key={d.id} className="flex items-center justify-between px-5 py-3">
            <span>{d.month}/{d.year} — <span className="capitalize">{d.draw_type}</span> — <span className="capitalize text-cream/60">{d.status}</span></span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {d.winning_numbers?.map((n: number) => <span key={n} className="number-ball !h-7 !w-7 !text-xs">{n}</span>)}
              </div>
              {d.status === "simulated" && (
                <button onClick={() => handlePublish(d.id)} className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-ink">Publish</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
