import { axiosInstance } from '@/api/axios';
import type { User } from '@/features/auth/types';

export const getMe = async (): Promise<User> => {
  const { data } = await axiosInstance.get<User>('/users/me');
  return data;
};
