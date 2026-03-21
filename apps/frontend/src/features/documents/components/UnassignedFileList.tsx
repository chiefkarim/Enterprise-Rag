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
    <div className="w-full lg:w-1/3 flex flex-col border-r border-border/50 bg-secondary/10">
      <div className="p-6 border-b border-border/50 bg-secondary/5">
        <h3 className="font-serif italic text-lg text-foreground flex items-center justify-between">
          <span>Unassigned Files</span>
          <Badge variant="default" className="bg-primary/10 text-primary font-bold px-3 rounded-full">{files.length}</Badge>
        </h3>
      </div>
      
      <div 
        className={`flex-1 overflow-y-auto p-6 space-y-3 transition-colors duration-200 ${draggedFileId ? 'bg-primary/5' : ''}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'unassigned')}
      >
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-4 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center shadow-inner">
              <FileText className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-light italic">All files assigned!</p>
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
