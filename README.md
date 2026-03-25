# Test Ride Booking App (MVP)

Een lightweight boekingsapp voor testritevents met publieke flow en adminbeheer.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Deploy op Vercel

## Features
- Landing page en publieke flow
- Overzicht actieve wagens
- Slotbeschikbaarheid per wagen + datum
- Boeking met server-side validatie (Zod)
- Bescherming tegen dubbele boekingen via partial unique index
- Admin login en dashboard
- Beheer van wagens, slots, boekingen
- Annuleren boekingen
- CSV-export

## Lokale setup
1. Installeer dependencies:
   ```bash
   npm install
   ```
2. Maak `.env.local` op basis van `.env.example`.
3. Start dev server:
   ```bash
   npm run dev
   ```

## Supabase setup
1. Maak een nieuw Supabase project.
2. Voer SQL migratie uit:
   - `supabase/migrations/001_init.sql`
3. Activeer email/password auth voor admin user(s).
4. Voeg admin email(s) toe in `ADMIN_EMAILS` env var.

## Migrations uitvoeren
Gebruik Supabase CLI of SQL Editor:
```bash
supabase db push
```

## Seed script draaien
```bash
npm run seed
```
Dit maakt 2 locaties, 3 wagens en slots over 2 dagen van 09:00 tot 17:00 (30 min + 10 min buffer).

## Vercel deploy
1. Push repository naar Git provider.
2. Importeer project in Vercel.
3. Stel env vars in vanuit `.env.example`.
4. Deploy.

## Default admin setup
- Maak in Supabase Auth handmatig admin users aan.
- Enkel emails in `ADMIN_EMAILS` krijgen toegang tot adminpagina's.

## Belangrijkste flows
- Publiek: `/` → `/wagens` → `/wagens/[slug]` → `/boeken/[vehicleSlug]/[slotId]` → `/bevestiging/[bookingId]`
- Admin: `/admin/login` → `/admin` → beheerpagina’s

## Opmerking over dubbele boekingen
De database is de bron van waarheid:
- `bookings(slot_id)` heeft een **partial unique index** voor `status = 'confirmed'`.
- `create_booking` PL/pgSQL functie controleert consistentie + slotbeschikbaarheid in transactiecontext.
