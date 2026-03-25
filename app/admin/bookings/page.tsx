import { adminCancelBooking, adminListBookings } from "@/actions/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate, formatTime } from "@/lib/utils";
import { redirect } from "next/navigation";

async function cancelBooking(formData: FormData) {
  "use server";
  await adminCancelBooking(String(formData.get("id")));
  redirect("/admin/bookings");
}

export default async function AdminBookingsPage() {
  await requireAdmin();
  const bookings = await adminListBookings();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Boekingen</h1>
        <a className="rounded bg-slate-900 px-3 py-2 text-white" href="/api/admin/export-bookings">CSV export</a>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-3">Ref</th><th className="p-3">Datum</th><th className="p-3">Wagen</th><th className="p-3">Naam</th><th className="p-3">Status</th><th className="p-3">Actie</th></tr></thead>
          <tbody>{bookings.map((booking) => <tr key={booking.id} className="border-t"><td className="p-3">{booking.reference_code}</td><td className="p-3">{formatDate(booking.slot.start_at)} {formatTime(booking.slot.start_at)}</td><td className="p-3">{booking.vehicle?.name}</td><td className="p-3">{booking.first_name} {booking.last_name}</td><td className="p-3">{booking.status}</td><td className="p-3">{booking.status === "confirmed" ? <form action={cancelBooking}><input type="hidden" name="id" value={booking.id} /><button className="text-red-600">Annuleer</button></form> : "-"}</td></tr>)}</tbody></table>
      </div>
    </section>
  );
}
