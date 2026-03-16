import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { FileCard } from './FileCard';
import type { FileItem } from '../types';

interface UnassignedFileListProps {
  files: FileItem[];
  draggedFileId: string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, target: string) => void;
}

export const UnassignedFileList: React.FC<UnassignedFileListProps> = ({
  files,
  draggedFileId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) => {
  return (
    <div className="w-full lg:w-1/3 flex flex-col border-r border-border bg-white/[0.02]">
      <div className="p-4 border-b border-border bg-white/5">
        <h3 className="font-semibold text-white flex items-center justify-between">
          <span>Unassigned Files</span>
          <Badge variant="default">{files.length}</Badge>
        </h3>
      </div>
      
      <div 
        className={`flex-1 overflow-y-auto p-4 space-y-2 transition-colors duration-200 ${draggedFileId ? 'bg-primary/5' : ''}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'unassigned')}
      >
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-3 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm">All files assigned!</p>
          </div>
        ) : (
          files.map(file => (
            <FileCard
              key={file.id}
              file={file}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
};
