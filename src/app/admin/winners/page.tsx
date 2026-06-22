"use client";
import { useEffect, useState } from "react";

export default function AdminWinners() {
  const [winners, setWinners] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/winners/verify");
    const data = await res.json();
    setWinners(data.winners ?? []);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/winners/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner_id: id, status })
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-medium">Winners</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/5 text-cream/50">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Tier</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Proof</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {winners.map((w: any) => (
              <tr key={w.id} className="border-t border-cream/10">
                <td className="px-4 py-3">{w.profiles?.full_name || w.user_id}</td>
                <td className="px-4 py-3">{w.tier}-match</td>
                <td className="px-4 py-3">${Number(w.prize_amount).toFixed(2)}</td>
                <td className="px-4 py-3">{w.proof_url ? <a href={w.proof_url} target="_blank" className="text-coral underline">View</a> : "—"}</td>
                <td className="px-4 py-3 capitalize">{w.status}</td>
                <td className="px-4 py-3 flex gap-2">
                  {w.status === "pending" && <>
                    <button onClick={() => updateStatus(w.id, "approved")} className="rounded-full bg-moss px-3 py-1 text-xs font-semibold">Approve</button>
                    <button onClick={() => updateStatus(w.id, "rejected")} className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold">Reject</button>
                  </>}
                  {w.status === "approved" && <button onClick={() => updateStatus(w.id, "paid")} className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Mark paid</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
