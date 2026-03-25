import Link from "next/link";
import { Vehicle } from "@/types";

export const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
  <article className="rounded-xl bg-white p-4 shadow">
    {vehicle.image_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={vehicle.image_url} alt={vehicle.name} className="h-40 w-full rounded-lg object-cover" />
    ) : (
      <div className="h-40 rounded-lg bg-slate-200" />
    )}
    <h3 className="mt-3 text-xl font-semibold">{vehicle.name}</h3>
    <p className="text-sm text-slate-600">{vehicle.short_description}</p>
    <p className="mt-1 text-sm">Locatie: {vehicle.location?.name}</p>
    <Link className="mt-3 inline-block rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white" href={`/wagens/${vehicle.slug}`}>
      Bekijk beschikbare slots
    </Link>
  </article>
);
