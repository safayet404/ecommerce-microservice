// EmailCreateSchema.ts
import { z } from "zod";

export const EmailCreateSchema = z.object({
  sender: z.string().email().optional(), // <-- was required; now optional
  recipient: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  source: z.string().min(1).optional(), // adjust to your needs
});
