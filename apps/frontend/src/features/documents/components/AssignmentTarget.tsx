import { GripVertical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { FileItem } from '../types';

interface AssignmentTargetProps {
  id: string;
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  assignedFiles: FileItem[];
  draggedFileId: string | null;
  activeBorderClassName?: string;
  activeBgClassName?: string;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, target: string) => void;
}

export const AssignmentTarget: React.FC<AssignmentTargetProps> = ({
  id,
  title,
  icon: Icon,
  iconClassName = "text-primary",
  assignedFiles,
  draggedFileId,
  activeBorderClassName = "border-primary/30",
  activeBgClassName = "bg-primary/10",
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) => {
  return (
    <div 
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, id)}
      className={`border rounded-xl p-4 transition-all duration-200 
        ${draggedFileId ? `${activeBorderClassName} ${activeBgClassName}` : 'border-white/10 bg-white/5'}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <Icon className={`w-4 h-4 shrink-0 ${iconClassName}`} />
          <h4 className="font-medium text-white/90 truncate" title={title}>{title}</h4>
        </div>
        <Badge variant="default">{assignedFiles.length}</Badge>
      </div>
      <div className="space-y-1.5 min-h-[40px] rounded-lg p-1">
        {assignedFiles.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-white/50">Drop files here</span>
          </div>
        ) : (
          assignedFiles.map(f => (
            <div
              key={f.id}
              draggable
              onDragStart={(e) => onDragStart(e, f.id)}
              onDragEnd={onDragEnd}
              className="bg-black/40 border border-white/10 rounded px-2 py-1.5 flex items-center gap-2 cursor-grab active:cursor-grabbing text-xs text-white/80 hover:bg-white/5"
            >
              <GripVertical className="w-3 h-3 text-white/30" />
              <span className="truncate" title={f.name}>{f.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
