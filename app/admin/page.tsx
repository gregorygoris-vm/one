import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function AdminDashboard() {
  await requireAdmin();

  const [vehicles, slots, bookings, freeToday] = await Promise.all([
    supabaseAdmin.from("vehicles").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("time_slots").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }),
    supabaseAdmin.rpc("count_free_slots_today"),
  ]);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Wagens" value={vehicles.count ?? 0} />
        <Stat label="Slots" value={slots.count ?? 0} />
        <Stat label="Boekingen" value={bookings.count ?? 0} />
        <Stat label="Vrije slots vandaag" value={freeToday.data ?? 0} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/vehicles" className="rounded bg-blue-700 px-3 py-2 text-white">Beheer wagens</Link>
        <Link href="/admin/slots" className="rounded bg-blue-700 px-3 py-2 text-white">Beheer slots</Link>
        <Link href="/admin/bookings" className="rounded bg-blue-700 px-3 py-2 text-white">Beheer boekingen</Link>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </article>
  );
}
