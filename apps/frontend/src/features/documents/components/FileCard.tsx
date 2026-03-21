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
      className="group bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all duration-300"
    >
      <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary/50 transition-colors" />
      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
        <FileText className="w-4 h-4 text-primary opacity-60" />
      </div>
      <span className="text-sm text-foreground/80 truncate flex-1 font-light" title={file.name}>
        {file.name}
      </span>
    </div>
  );
};
