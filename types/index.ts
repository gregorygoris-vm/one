export type Location = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  is_active: boolean;
};

export type Vehicle = {
  id: string;
  location_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  short_description: string | null;
  is_active: boolean;
  location?: Location;
};

export type TimeSlot = {
  id: string;
  vehicle_id: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
};

export type Booking = {
  id: string;
  slot_id: string;
  vehicle_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  note: string | null;
  privacy_consent: boolean;
  status: "confirmed" | "cancelled";
  reference_code: string;
  created_at: string;
};
