import Link from "next/link";
import { adminListVehicles } from "@/actions/admin";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminVehiclesPage() {
  await requireAdmin();
  const vehicles = await adminListVehicles();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wagens</h1>
        <Link href="/admin/vehicles/new" className="rounded bg-slate-900 px-3 py-2 text-white">Nieuwe wagen</Link>
      </div>
      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr><th className="p-3">Naam</th><th className="p-3">Locatie</th><th className="p-3">Status</th><th className="p-3">Actie</th></tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t">
                <td className="p-3">{vehicle.name}</td>
                <td className="p-3">{vehicle.location?.name}</td>
                <td className="p-3">{vehicle.is_active ? "Actief" : "Inactief"}</td>
                <td className="p-3"><Link href={`/admin/vehicles/${vehicle.id}`} className="text-blue-700">Bewerk</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
