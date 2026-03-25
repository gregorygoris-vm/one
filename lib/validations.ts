import { z } from "zod";

export const bookingSchema = z.object({
  slotId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  note: z.string().optional(),
  privacy_consent: z.literal(true),
});
