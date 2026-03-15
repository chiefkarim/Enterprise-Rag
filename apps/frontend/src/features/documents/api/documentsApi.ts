import { axiosInstance } from '@/api/axios';

export interface Document {
  id: number;
  file_name: string;
  state: 'pending' | 'embedded' | 'failed';
  source_file_update_at: string;
  created_at: string;
  updated_at: string;
}

export const getDocuments = async (): Promise<Document[]> => {
  const { data } = await axiosInstance.get<Document[]>('/documents/');
  return data;
};
