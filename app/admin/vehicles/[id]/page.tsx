import { adminUpdateVehicle } from "@/actions/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { notFound, redirect } from "next/navigation";

async function updateVehicle(id: string, formData: FormData) {
  "use server";
  await adminUpdateVehicle(id, {
    name: String(formData.get("name")),
    slug: String(formData.get("slug")),
    image_url: String(formData.get("image_url") || "") || null,
    short_description: String(formData.get("short_description") || "") || null,
    is_active: formData.get("is_active") === "on",
  });
  redirect("/admin/vehicles");
}

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { data: vehicle } = await supabaseAdmin.from("vehicles").select("*").eq("id", id).single();
  if (!vehicle) notFound();

  return (
    <section className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Wagen bewerken</h1>
      <form action={updateVehicle.bind(null, id)} className="space-y-3 rounded-xl bg-white p-4 shadow">
        <input name="name" className="w-full rounded border p-2" defaultValue={vehicle.name} required />
        <input name="slug" className="w-full rounded border p-2" defaultValue={vehicle.slug} required />
        <input name="image_url" className="w-full rounded border p-2" defaultValue={vehicle.image_url ?? ""} />
        <textarea name="short_description" className="w-full rounded border p-2" defaultValue={vehicle.short_description ?? ""} />
        <label className="flex gap-2"><input type="checkbox" name="is_active" defaultChecked={vehicle.is_active} /> Actief</label>
        <button className="rounded bg-blue-700 px-4 py-2 text-white">Opslaan</button>
      </form>
    </section>
  );
}
