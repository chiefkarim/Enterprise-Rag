import { axiosInstance } from '@/api/axios';
import type { LoginRequest, LoginResponse } from '@/features/auth/types';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>('/login', credentials);
  return data;
};
