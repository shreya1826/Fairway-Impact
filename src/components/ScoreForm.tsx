"use client";
import { useState } from "react";

export default function ScoreForm({ onAdded }: { onAdded: () => void }) {
  const [score, setScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const numScore = Number(score);
    if (numScore < 1 || numScore > 45) {
      setError("Score must be between 1 and 45 (Stableford points).");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: numScore, played_on: date })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not save score.");
      return;
    }
    setScore("");
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink/60">Date played</label>
        <input
          type="date"
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          className="focus-ring rounded-lg border border-ink/15 px-3 py-2"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink/60">Stableford score (1–45)</label>
        <input
          type="number"
          min={1}
          max={45}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="focus-ring w-28 rounded-lg border border-ink/15 px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="focus-ring rounded-full bg-coral px-5 py-2 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Add score"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      <p className="w-full text-xs text-ink/50">Only your 5 most recent scores are kept — adding a new one retires the oldest. One entry per date.</p>
    </form>
  );
}
