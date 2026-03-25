import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: locations } = await supabase
    .from("locations")
    .upsert([
      { name: "Antwerpen", slug: "antwerpen", address: "Eventsite Antwerpen", is_active: true },
      { name: "Gent", slug: "gent", address: "Eventsite Gent", is_active: true },
    ], { onConflict: "slug" })
    .select();

  if (!locations) return;

  const antwerp = locations.find((l) => l.slug === "antwerpen")!;
  const ghent = locations.find((l) => l.slug === "gent")!;

  const { data: vehicles } = await supabase
    .from("vehicles")
    .upsert([
      { name: "Volvo EX30", slug: "volvo-ex30", location_id: antwerp.id, short_description: "Compact elektrisch en modern", is_active: true },
      { name: "Polestar 2", slug: "polestar-2", location_id: antwerp.id, short_description: "Premium elektrische fastback", is_active: true },
      { name: "Nissan Qashqai", slug: "nissan-qashqai", location_id: ghent.id, short_description: "Ruime en praktische crossover", is_active: true },
    ], { onConflict: "slug" })
    .select();

  if (!vehicles) return;

  const dates = [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)];
  for (const vehicle of vehicles) {
    for (const date of dates) {
      const yyyyMmDd = date.toISOString().slice(0, 10);
      await supabase.rpc("bulk_generate_slots", {
        p_vehicle_id: vehicle.id,
        p_date: yyyyMmDd,
        p_start_time: "09:00",
        p_end_time: "17:00",
        p_duration_minutes: 30,
        p_buffer_minutes: 10,
      });
    }
  }

  console.log("Seed completed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
