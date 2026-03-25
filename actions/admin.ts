"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const adminListVehicles = async () => {
  const { data } = await supabaseAdmin.from("vehicles").select("*, location:locations(*)").order("created_at", { ascending: false });
  return data ?? [];
};

export const adminCreateVehicle = async (payload: Record<string, unknown>) => {
  return supabaseAdmin.from("vehicles").insert(payload);
};

export const adminUpdateVehicle = async (id: string, payload: Record<string, unknown>) => {
  return supabaseAdmin.from("vehicles").update(payload).eq("id", id);
};

export const adminListSlots = async () => {
  const { data } = await supabaseAdmin.from("time_slots").select("*, vehicle:vehicles(name)").order("start_at", { ascending: true });
  return data ?? [];
};

export const adminCreateSlot = async (payload: Record<string, unknown>) => {
  return supabaseAdmin.from("time_slots").insert(payload);
};

export const adminUpdateSlot = async (id: string, payload: Record<string, unknown>) => {
  return supabaseAdmin.from("time_slots").update(payload).eq("id", id);
};

export const adminBulkGenerateSlots = async (payload: {
  vehicle_id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  buffer: number;
}) => {
  return supabaseAdmin.rpc("bulk_generate_slots", {
    p_vehicle_id: payload.vehicle_id,
    p_date: payload.date,
    p_start_time: payload.startTime,
    p_end_time: payload.endTime,
    p_duration_minutes: payload.duration,
    p_buffer_minutes: payload.buffer,
  });
};

export const adminListBookings = async () => {
  const { data } = await supabaseAdmin
    .from("bookings")
    .select("*, slot:time_slots(start_at,end_at), vehicle:vehicles(name,location:locations(name))")
    .order("created_at", { ascending: false });
  return data ?? [];
};

export const adminCancelBooking = async (id: string) => {
  return supabaseAdmin.from("bookings").update({ status: "cancelled" }).eq("id", id);
};
