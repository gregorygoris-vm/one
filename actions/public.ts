"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { bookingSchema } from "@/lib/validations";

type BookingInput = {
  slotId: string;
  vehicleId: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  note?: string;
  privacy_consent: true;
};

export const getActiveLocations = async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("locations").select("*").eq("is_active", true).order("name");
  return data ?? [];
};

export const getActiveVehicles = async (locationSlug?: string) => {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("vehicles")
    .select("*, location:locations(*)")
    .eq("is_active", true)
    .order("name");
  if (locationSlug) query = query.eq("locations.slug", locationSlug);
  const { data } = await query;
  return data ?? [];
};

export const getVehicleBySlug = async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*, location:locations(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data;
};

export const getAvailableSlots = async (vehicleId: string, date: string) => {
  const supabase = await createSupabaseServerClient();
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;
  const { data } = await supabase
    .from("time_slots")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .eq("is_active", true)
    .gte("start_at", start)
    .lte("start_at", end)
    .not("id", "in", `(select slot_id from bookings where status = 'confirmed')`)
    .order("start_at");
  return data ?? [];
};

export const createBooking = async (input: BookingInput) => {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Vul alle verplichte velden in." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_booking", {
    p_slot_id: parsed.data.slotId,
    p_vehicle_id: parsed.data.vehicleId,
    p_first_name: parsed.data.first_name,
    p_last_name: parsed.data.last_name,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_note: parsed.data.note ?? null,
  });

  if (error) {
    if (error.message.includes("UNIQUE") || error.message.includes("not available")) {
      return { error: "Dit tijdslot is net geboekt. Kies een ander moment." };
    }
    return { error: "Er ging iets mis. Probeer opnieuw." };
  }

  return { bookingId: data as string };
};
