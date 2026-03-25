import { getAvailableSlots, getVehicleBySlug } from "@/actions/public";
import { SlotList } from "@/components/SlotList";
import { notFound } from "next/navigation";

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const qp = await searchParams;
  const date = qp.date ?? new Date().toISOString().slice(0, 10);

  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const slots = await getAvailableSlots(vehicle.id, date);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">{vehicle.name}</h1>
      <p className="text-slate-600">{vehicle.short_description}</p>
      <form className="rounded-xl bg-white p-3 shadow" method="get">
        <label className="text-sm font-medium">Kies een datum</label>
        <input type="date" name="date" defaultValue={date} className="ml-2 rounded border p-2" />
        <button className="ml-2 rounded bg-slate-900 px-3 py-2 text-white">Toon slots</button>
      </form>
      <SlotList slots={slots} vehicle={vehicle} />
    </section>
  );
}
