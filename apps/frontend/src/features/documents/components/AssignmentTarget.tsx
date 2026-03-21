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
      className={`border rounded-2xl p-5 transition-all duration-300 shadow-sm
        ${draggedFileId ? `${activeBorderClassName} ${activeBgClassName} scale-[1.02]` : 'border-border/30 bg-card hover:border-primary/20 hover:bg-secondary/20'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <Icon className={`w-5 h-5 shrink-0 ${iconClassName} opacity-70`} />
          <h4 className="font-serif italic font-medium text-foreground truncate" title={title}>{title}</h4>
        </div>
        <Badge variant="default" className="bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md">{assignedFiles.length}</Badge>
      </div>
      <div className="space-y-2 min-h-[50px] rounded-xl bg-secondary/10 p-2 border border-dashed border-border/30">
        {assignedFiles.length === 0 ? (
          <div className="h-full flex items-center justify-center py-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Drop items</span>
          </div>
        ) : (
          assignedFiles.map(f => (
            <div
              key={f.id}
              draggable
              onDragStart={(e) => onDragStart(e, f.id)}
              onDragEnd={onDragEnd}
              className="bg-background/80 border border-border/50 rounded-lg px-3 py-2 flex items-center gap-2 cursor-grab active:cursor-grabbing text-xs text-foreground/80 hover:border-primary/30 transition-all shadow-sm"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground/30" />
              <span className="truncate font-light flex-1" title={f.name}>{f.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
