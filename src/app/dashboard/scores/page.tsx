"use client";
import { useEffect, useState, useCallback } from "react";
import ScoreForm from "@/components/ScoreForm";
import ScoreList from "@/components/ScoreList";
import type { Score } from "@/types/database";

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/scores");
    const data = await res.json();
    setScores(data.scores ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    await fetch(`/api/scores?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-medium">Your scores</h1>
      <p className="mt-2 text-sm text-ink/60">These double as your numbers for the monthly draw.</p>
      <div className="mt-6"><ScoreForm onAdded={load} /></div>
      <div className="mt-6">{loading ? <p className="text-sm text-ink/50">Loading…</p> : <ScoreList scores={scores} onDelete={handleDelete} />}</div>
    </div>
  );
}
