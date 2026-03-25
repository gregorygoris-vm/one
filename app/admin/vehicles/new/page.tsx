import { adminCreateVehicle } from "@/actions/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

async function createVehicle(formData: FormData) {
  "use server";
  await adminCreateVehicle({
    location_id: String(formData.get("location_id")),
    name: String(formData.get("name")),
    slug: String(formData.get("slug")),
    image_url: String(formData.get("image_url") || "") || null,
    short_description: String(formData.get("short_description") || "") || null,
    is_active: formData.get("is_active") === "on",
  });
  redirect("/admin/vehicles");
}

export default async function NewVehiclePage() {
  await requireAdmin();
  const { data: locations } = await supabaseAdmin.from("locations").select("id,name").eq("is_active", true);

  return (
    <section className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Nieuwe wagen</h1>
      <form action={createVehicle} className="space-y-3 rounded-xl bg-white p-4 shadow">
        <input name="name" className="w-full rounded border p-2" placeholder="Naam" required />
        <input name="slug" className="w-full rounded border p-2" placeholder="Slug" required />
        <select name="location_id" className="w-full rounded border p-2" required>
          {(locations ?? []).map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
        </select>
        <input name="image_url" className="w-full rounded border p-2" placeholder="Image URL" />
        <textarea name="short_description" className="w-full rounded border p-2" placeholder="Beschrijving" />
        <label className="flex gap-2"><input type="checkbox" name="is_active" defaultChecked /> Actief</label>
        <button className="rounded bg-blue-700 px-4 py-2 text-white">Opslaan</button>
      </form>
    </section>
  );
}
