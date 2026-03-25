"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/actions/public";

export const BookingForm = ({ slotId, vehicleId }: { slotId: string; vehicleId: string }) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <form
      className="space-y-3 rounded-xl bg-white p-4 shadow"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsPending(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const response = await createBooking({
          slotId,
          vehicleId,
          first_name: String(form.get("first_name") || ""),
          last_name: String(form.get("last_name") || ""),
          email: String(form.get("email") || ""),
          phone: String(form.get("phone") || ""),
          note: String(form.get("note") || ""),
          privacy_consent: form.get("privacy_consent") === "on",
        } as never);
        setIsPending(false);

        if (response.error) {
          setError(response.error);
          return;
        }
        router.push(`/bevestiging/${response.bookingId}`);
      }}
    >
      <h2 className="text-xl font-semibold">Jouw gegevens</h2>
      <input className="w-full rounded border p-2" name="first_name" placeholder="Voornaam" required />
      <input className="w-full rounded border p-2" name="last_name" placeholder="Naam" required />
      <input className="w-full rounded border p-2" name="email" type="email" placeholder="E-mail" required />
      <input className="w-full rounded border p-2" name="phone" placeholder="Gsm" required />
      <textarea className="w-full rounded border p-2" name="note" placeholder="Opmerking (optioneel)" />
      <label className="flex gap-2 text-sm">
        <input name="privacy_consent" type="checkbox" required /> Ik geef toestemming voor verwerking van mijn gegevens.
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button disabled={isPending} className="rounded bg-blue-700 px-4 py-2 font-semibold text-white">
        {isPending ? "Bezig..." : "Bevestig boeking"}
      </button>
    </form>
  );
};
