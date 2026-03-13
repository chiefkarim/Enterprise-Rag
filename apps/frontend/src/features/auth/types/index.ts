import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  is_active: z.boolean(),
});

export type User = z.infer<typeof userResponseSchema>;
