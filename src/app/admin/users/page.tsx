import { createClient } from "@/lib/supabase/server";

export default async function AdminUsers() {
  const supabase = createClient();
  const { data: profiles } = await supabase.from("profiles").select("*, charities(name)").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl font-medium">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/5 text-cream/50">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Charity</th><th className="px-4 py-3">Contribution</th></tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-cream/10">
                <td className="px-4 py-3">{p.full_name || "—"}</td>
                <td className="px-4 py-3 capitalize">{p.role}</td>
                <td className="px-4 py-3">{p.charities?.name || "—"}</td>
                <td className="px-4 py-3">{p.charity_percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-cream/40">Edit a user's scores or subscription directly in the Supabase Table Editor for now — wire up inline editing here as a next iteration.</p>
    </div>
  );
}
