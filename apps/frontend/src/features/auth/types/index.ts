import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  role: z.string(),
  created_at: z.string(),
});

export type User = z.infer<typeof userSchema>;

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
