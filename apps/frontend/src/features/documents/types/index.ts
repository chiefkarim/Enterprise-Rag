export interface FileItem {
  id: string;
  name: string;
}

export interface EmbedGroup {
  department?: string;
  project_id?: string;
  files: FileItem[];
}

export interface Document {
  id: number;
  file_name: string;
  state: 'pending' | 'embedded' | 'failed';
  source_file_update_at: string;
  created_at: string;
  updated_at: string;
}

export interface EmbedRequest {
  file_ids: string[];
  department?: string;
  project_id?: string;
}
