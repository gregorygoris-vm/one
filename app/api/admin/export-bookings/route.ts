import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatDate, formatTime } from "@/lib/utils";

export async function GET() {
  const { data } = await supabaseAdmin
    .from("bookings")
    .select("*, slot:time_slots(start_at,end_at), vehicle:vehicles(name,location:locations(name))")
    .order("created_at", { ascending: false });

  const rows = [
    ["booking_reference", "created_at", "date", "start_time", "end_time", "location", "vehicle", "first_name", "last_name", "email", "phone", "note", "status"],
    ...(data ?? []).map((booking) => [
      booking.reference_code,
      booking.created_at,
      formatDate(booking.slot.start_at),
      formatTime(booking.slot.start_at),
      formatTime(booking.slot.end_at),
      booking.vehicle?.location?.name ?? "",
      booking.vehicle?.name ?? "",
      booking.first_name,
      booking.last_name,
      booking.email,
      booking.phone,
      booking.note ?? "",
      booking.status,
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=bookings-${new Date().toISOString().slice(0, 10)}.csv`,
    },
  });
}
