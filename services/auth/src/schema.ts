import { email, z } from "zod";

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3),
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AccessTokenSchema = z.object({
  token: z.string(),
});
