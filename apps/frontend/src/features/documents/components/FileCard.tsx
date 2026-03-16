import { FileText, GripVertical } from 'lucide-react';
import type { FileItem } from '../types';

interface FileCardProps {
  file: FileItem;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDragStart, onDragEnd }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, file.id)}
      onDragEnd={onDragEnd}
      className="group bg-white/5 border border-border hover:border-primary/50 rounded-lg p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all hover:bg-white/10"
    >
      <GripVertical className="w-4 h-4 text-white/30 group-hover:text-white/60" />
      <FileText className="w-4 h-4 text-primary" />
      <span className="text-sm text-white/90 truncate flex-1" title={file.name}>
        {file.name}
      </span>
    </div>
  );
};
