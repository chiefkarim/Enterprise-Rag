import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactGoogleDrivePicker from 'react-google-drive-picker';
import { embedDocuments } from '../api/documentsApi';
import type { EmbedGroup, FileItem } from '../types';

const useDrivePicker = (ReactGoogleDrivePicker as any).useDrivePicker || (ReactGoogleDrivePicker as any).default || ReactGoogleDrivePicker;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const GOOGLE_APP_ID = import.meta.env.VITE_GOOGLE_APP_ID || '';

export function useDocumentActions() {
  const queryClient = useQueryClient();
  const [openPicker] = useDrivePicker();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickedFiles, setPickedFiles] = useState<{ id: string; name: string }[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const embedMutation = useMutation({
    mutationFn: embedDocuments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      console.error('Error embedding documents:', error);
    }
  });

  const handleOpenPicker = () => {
    openPicker({
      clientId: GOOGLE_CLIENT_ID,
      developerKey: GOOGLE_API_KEY,
      appId: GOOGLE_APP_ID,
      viewId: 'DOCS',
      token: '',
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      customViews: [
        {
          viewId: 'DOCS',
          mimeTypes: 'application/pdf',
        }
      ],
      callbackFunction: (data: any) => {
        if (data.action === 'picked' && data.docs) {
          const files = data.docs.map((doc: any) => ({
            id: doc.id,
            name: doc.name
          }));
          if (files.length > 0) {
            setPickedFiles(files);
            setIsAssigning(true);
          }
        }
      },
    });
  };

  const handleAssignmentSubmit = async (groups: EmbedGroup[]) => {
    setIsSubmitting(true);
    try {
      await Promise.all(
        groups.map(group => {
          const payload: { file_ids: string[]; department?: string; project_id?: string } = {
            file_ids: group.files.map((f: FileItem) => f.id)
          };
          if (group.department) {
            payload.department = group.department;
          }
          if (group.project_id) {
            payload.project_id = group.project_id;
          }
          return embedMutation.mutateAsync(payload);
        })
      );
      setIsAssigning(false);
      setPickedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (error) {
      console.error('Error in batch embedding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isAssigning,
    pickedFiles,
    setIsAssigning,
    setPickedFiles,
    handleOpenPicker,
    handleAssignmentSubmit,
    embedMutation
  };
}
