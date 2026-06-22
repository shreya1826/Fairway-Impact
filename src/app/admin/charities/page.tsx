"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Charity } from "@/types/database";

export default function AdminCharities() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [form, setForm] = useState({ name: "", description: "", image_url: "", website: "", featured: false });
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("charities").select("*").order("created_at", { ascending: false });
    setCharities(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("charities").insert(form);
    setForm({ name: "", description: "", image_url: "", website: "", featured: false });
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from("charities").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-medium">Charities</h1>
      <form onSubmit={handleAdd} className="mt-6 grid gap-3 rounded-2xl border border-cream/10 bg-cream/5 p-5 md:grid-cols-2">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg bg-cream/10 px-3 py-2 placeholder:text-cream/40" />
        <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="rounded-lg bg-cream/10 px-3 py-2 placeholder:text-cream/40" />
        <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 rounded-lg bg-cream/10 px-3 py-2 placeholder:text-cream/40" />
        <input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="rounded-lg bg-cream/10 px-3 py-2 placeholder:text-cream/40" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
        <button className="md:col-span-2 rounded-full bg-coral py-2 font-semibold text-white">Add charity</button>
      </form>
      <ul className="mt-6 divide-y divide-cream/10 rounded-2xl border border-cream/10">
        {charities.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-5 py-3">
            <span>{c.name} {c.featured && <span className="ml-2 text-xs text-gold">★ featured</span>}</span>
            <button onClick={() => handleDelete(c.id)} className="text-xs text-cream/40 hover:text-coral">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
