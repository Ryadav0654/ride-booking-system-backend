import * as z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(32),
  deviceId: z.uuidv4(),
  deviceToken: z.string(),
  deviceType: z.string(),
});

export const registerSchema = z.object({
  email: z.email().trim(),
  name: z.string().trim().min(3).max(32),
  password: z.string().trim().min(8).max(32),
});
