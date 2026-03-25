import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatDate, formatTime } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ConfirmationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const { data } = await supabaseAdmin
    .from("bookings")
    .select("*, slot:time_slots(start_at,end_at), vehicle:vehicles(name, location:locations(name))")
    .eq("id", bookingId)
    .single();

  if (!data) notFound();

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-green-700">Boeking bevestigd</h1>
      <p className="mt-2">Referentie: <strong>{data.reference_code}</strong></p>
      <ul className="mt-4 space-y-1 text-slate-700">
        <li>Wagen: {data.vehicle.name}</li>
        <li>Locatie: {data.vehicle.location?.name}</li>
        <li>Datum: {formatDate(data.slot.start_at)}</li>
        <li>Uur: {formatTime(data.slot.start_at)} - {formatTime(data.slot.end_at)}</li>
        <li>Klant: {data.first_name} {data.last_name}</li>
      </ul>
    </section>
  );
}
