import { z } from "zod";

export const UserCreateSchema = z.object({
  authUserId: z.string().min(1),
  email: z.string().email().min(1),
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const UserUpdateSchema = UserCreateSchema.omit({
  authUserId: true,
}).partial();
