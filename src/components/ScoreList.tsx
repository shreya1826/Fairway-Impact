"use client";
import type { Score } from "@/types/database";

export default function ScoreList({ scores, onDelete }: { scores: Score[]; onDelete: (id: string) => void }) {
  if (scores.length === 0) {
    return <p className="text-sm text-ink/50">No scores yet — add your first round above.</p>;
  }
  return (
    <ul className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
      {scores.map((s) => (
        <li key={s.id} className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-ink/70">{new Date(s.played_on).toLocaleDateString()}</span>
          <span className="number-ball !h-9 !w-9 !text-sm">{s.score}</span>
          <button onClick={() => onDelete(s.id)} className="focus-ring text-xs font-medium text-ink/40 hover:text-coral">
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
