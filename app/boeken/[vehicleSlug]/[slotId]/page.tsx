import { getVehicleBySlug } from "@/actions/public";
import { BookingForm } from "@/components/BookingForm";
import { notFound } from "next/navigation";

export default async function BookingPage({ params }: { params: Promise<{ vehicleSlug: string; slotId: string }> }) {
  const { vehicleSlug, slotId } = await params;
  const vehicle = await getVehicleBySlug(vehicleSlug);
  if (!vehicle) notFound();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Boek je testrit: {vehicle.name}</h1>
      <BookingForm slotId={slotId} vehicleId={vehicle.id} />
    </section>
  );
}
