import { axiosInstance } from '@/api/axios';
import type { LoginRequest, LoginResponse, SignUpRequest, User } from '@/features/auth/types';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>('/login', credentials);
  return data;
};

export const signup = async (userData: SignUpRequest): Promise<User> => {
  const { data } = await axiosInstance.post<User>('/signup', userData);
  return data;
};

export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>('/refresh', { refresh_token: refreshToken });
  return data;
};
