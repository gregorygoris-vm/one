import { adminBulkGenerateSlots, adminCreateSlot, adminListSlots } from "@/actions/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatDate, formatTime } from "@/lib/utils";
import { redirect } from "next/navigation";

async function createSlot(formData: FormData) {
  "use server";
  await adminCreateSlot({
    vehicle_id: String(formData.get("vehicle_id")),
    start_at: String(formData.get("start_at")),
    end_at: String(formData.get("end_at")),
    is_active: true,
  });
  redirect("/admin/slots");
}

async function bulkSlots(formData: FormData) {
  "use server";
  await adminBulkGenerateSlots({
    vehicle_id: String(formData.get("vehicle_id")),
    date: String(formData.get("date")),
    startTime: String(formData.get("start_time")),
    endTime: String(formData.get("end_time")),
    duration: Number(formData.get("duration")),
    buffer: Number(formData.get("buffer")),
  });
  redirect("/admin/slots");
}

export default async function AdminSlotsPage() {
  await requireAdmin();
  const [slots, vehicles] = await Promise.all([
    adminListSlots(),
    supabaseAdmin.from("vehicles").select("id,name").eq("is_active", true),
  ]);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Slots</h1>
      <form action={createSlot} className="grid gap-2 rounded-xl bg-white p-4 shadow md:grid-cols-5">
        <select name="vehicle_id" className="rounded border p-2">{(vehicles.data ?? []).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
        <input type="datetime-local" name="start_at" className="rounded border p-2" required />
        <input type="datetime-local" name="end_at" className="rounded border p-2" required />
        <button className="rounded bg-blue-700 px-3 py-2 text-white">Slot toevoegen</button>
      </form>
      <form action={bulkSlots} className="grid gap-2 rounded-xl bg-white p-4 shadow md:grid-cols-7">
        <select name="vehicle_id" className="rounded border p-2">{(vehicles.data ?? []).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
        <input type="date" name="date" className="rounded border p-2" required />
        <input type="time" name="start_time" className="rounded border p-2" defaultValue="09:00" />
        <input type="time" name="end_time" className="rounded border p-2" defaultValue="17:00" />
        <input type="number" name="duration" className="rounded border p-2" defaultValue={30} />
        <input type="number" name="buffer" className="rounded border p-2" defaultValue={10} />
        <button className="rounded bg-slate-900 px-3 py-2 text-white">Bulk genereren</button>
      </form>
      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-3">Wagen</th><th className="p-3">Datum</th><th className="p-3">Tijd</th><th className="p-3">Status</th></tr></thead>
          <tbody>{slots.map((slot) => <tr key={slot.id} className="border-t"><td className="p-3">{slot.vehicle?.name}</td><td className="p-3">{formatDate(slot.start_at)}</td><td className="p-3">{formatTime(slot.start_at)} - {formatTime(slot.end_at)}</td><td className="p-3">{slot.is_active ? "Actief" : "Inactief"}</td></tr>)}</tbody></table>
      </div>
    </section>
  );
}
