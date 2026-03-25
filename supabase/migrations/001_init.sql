create extension if not exists "pgcrypto";

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete restrict,
  name text not null,
  slug text unique not null,
  image_url text,
  short_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists time_slots (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint valid_slot_window check (end_at > start_at)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references time_slots(id) on delete restrict,
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  note text,
  privacy_consent boolean not null default false,
  status text not null default 'confirmed',
  reference_code text unique not null,
  created_at timestamptz not null default now(),
  constraint booking_status check (status in ('confirmed', 'cancelled'))
);

create index if not exists idx_vehicles_location_id on vehicles(location_id);
create index if not exists idx_time_slots_vehicle_start on time_slots(vehicle_id, start_at);
create index if not exists idx_bookings_vehicle_id on bookings(vehicle_id);
create index if not exists idx_bookings_email on bookings(email);
create unique index if not exists idx_bookings_slot_confirmed_unique on bookings(slot_id) where status = 'confirmed';

create or replace function create_booking(
  p_slot_id uuid,
  p_vehicle_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_note text
) returns uuid
language plpgsql
as $$
declare
  v_slot record;
  v_booking_id uuid;
  v_reference text;
begin
  select ts.*,
         v.is_active as vehicle_is_active
  into v_slot
  from time_slots ts
  join vehicles v on v.id = ts.vehicle_id
  where ts.id = p_slot_id
  for update;

  if not found then
    raise exception 'Slot not found';
  end if;

  if v_slot.vehicle_id <> p_vehicle_id then
    raise exception 'Vehicle mismatch';
  end if;

  if v_slot.is_active is false or v_slot.vehicle_is_active is false then
    raise exception 'Slot not available';
  end if;

  if exists(select 1 from bookings b where b.slot_id = p_slot_id and b.status = 'confirmed') then
    raise exception 'Slot not available';
  end if;

  v_reference := concat('TR-', upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)));

  insert into bookings (
    slot_id,
    vehicle_id,
    first_name,
    last_name,
    email,
    phone,
    note,
    privacy_consent,
    status,
    reference_code
  ) values (
    p_slot_id,
    p_vehicle_id,
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_note,
    true,
    'confirmed',
    v_reference
  ) returning id into v_booking_id;

  return v_booking_id;
exception
  when unique_violation then
    raise exception 'Slot not available';
end;
$$;

create or replace function bulk_generate_slots(
  p_vehicle_id uuid,
  p_date date,
  p_start_time time,
  p_end_time time,
  p_duration_minutes int,
  p_buffer_minutes int
) returns int
language plpgsql
as $$
declare
  current_start timestamptz;
  current_end timestamptz;
  inserts int := 0;
begin
  current_start := (p_date::text || ' ' || p_start_time::text)::timestamptz;

  while current_start < (p_date::text || ' ' || p_end_time::text)::timestamptz loop
    current_end := current_start + make_interval(mins => p_duration_minutes);
    exit when current_end > (p_date::text || ' ' || p_end_time::text)::timestamptz;

    insert into time_slots(vehicle_id, start_at, end_at, is_active)
    values (p_vehicle_id, current_start, current_end, true);

    inserts := inserts + 1;
    current_start := current_end + make_interval(mins => p_buffer_minutes);
  end loop;

  return inserts;
end;
$$;

create or replace function count_free_slots_today() returns int
language sql
as $$
  select count(*)::int
  from time_slots ts
  join vehicles v on v.id = ts.vehicle_id
  where ts.is_active = true
    and v.is_active = true
    and ts.start_at::date = now()::date
    and not exists (
      select 1 from bookings b where b.slot_id = ts.id and b.status = 'confirmed'
    );
$$;
