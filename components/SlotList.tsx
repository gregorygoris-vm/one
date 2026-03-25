import Link from "next/link";
import { TimeSlot, Vehicle } from "@/types";
import { formatTime } from "@/lib/utils";

export const SlotList = ({ slots, vehicle }: { slots: TimeSlot[]; vehicle: Vehicle }) => {
  if (!slots.length) {
    return <p className="rounded-lg bg-amber-50 p-3 text-amber-700">Geen vrije slots gevonden. Kies een andere datum of wagen.</p>;
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {slots.map((slot) => (
        <li key={slot.id}>
          <Link className="block rounded-lg border bg-white p-3 hover:border-blue-600" href={`/boeken/${vehicle.slug}/${slot.id}`}>
            {formatTime(slot.start_at)} - {formatTime(slot.end_at)}
          </Link>
        </li>
      ))}
    </ul>
  );
};
