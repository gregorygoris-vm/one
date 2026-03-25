import { getActiveVehicles } from "@/actions/public";
import { VehicleCard } from "@/components/VehicleCard";

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const params = await searchParams;
  const vehicles = await getActiveVehicles(params.location);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Beschikbare wagens</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
}
