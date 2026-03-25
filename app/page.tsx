import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-8 shadow">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Test Ride Event</p>
      <h1 className="text-4xl font-bold">Boek je testrit in enkele stappen</h1>
      <p className="max-w-2xl text-slate-600">
        Kies je locatie, selecteer je wagen en reserveer een beschikbaar tijdslot. Je krijgt meteen een bevestiging.
      </p>
      <div className="flex gap-3">
        <Link className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white" href="/wagens">
          Boek je testrit
        </Link>
      </div>
    </section>
  );
}
