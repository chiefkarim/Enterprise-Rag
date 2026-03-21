import { X, Building2, FolderKanban, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/features/projects/api/projectsApi';
import { getDepartments } from '@/features/departments/api/departmentsApi';
import { useDocumentAssignment } from '../hooks/useDocumentAssignment';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UnassignedFileList } from './UnassignedFileList';
import { AssignmentTarget } from './AssignmentTarget';
import type { FileItem, EmbedGroup } from '../types';

interface AssignmentModalProps {
  files: FileItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groups: EmbedGroup[]) => void;
  isSubmitting?: boolean;
}

export default function AssignmentModal({ 
  files, 
  isOpen, 
  onClose, 
  onSubmit,
  isSubmitting 
}: AssignmentModalProps) {
  const {
    draggedFileId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    getUnassignedFiles,
    getAssignedFiles,
    getEmbedGroups
  } = useDocumentAssignment(files, isOpen);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    enabled: isOpen,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const unassignedFiles = getUnassignedFiles();
  const hasAssigned = files.length > unassignedFiles.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] border-border/50 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/50 bg-secondary/10">
          <div>
            <h2 className="text-2xl font-serif italic font-medium text-foreground tracking-tight">Assign Documents</h2>
            <p className="text-sm text-muted-foreground mt-1 font-light">
              Drag and drop documents to organize them into departments or projects before cultivation.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting} className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content layout: 2 columns */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-[450px]">
          
          <UnassignedFileList
            files={unassignedFiles}
            draggedFileId={draggedFileId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />

          {/* Right Column: Drop Targets */}
          <div className="w-full lg:w-2/3 flex flex-col bg-secondary/5">
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Departments */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary pb-3 border-b border-border/30">
                  <Building2 className="w-5 h-5 opacity-70" />
                  <h3 className="font-serif text-lg italic">Departments</h3>
                </div>
                <div className="space-y-4">
                  {departments.map(dept => {
                    const targetId = `dept-${dept.name.toLowerCase()}`;
                    return (
                      <AssignmentTarget
                        key={targetId}
                        id={targetId}
                        title={dept.name}
                        icon={Building2}
                        assignedFiles={getAssignedFiles(targetId)}
                        draggedFileId={draggedFileId}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary pb-3 border-b border-border/30">
                  <FolderKanban className="w-5 h-5 opacity-70" />
                  <h3 className="font-serif text-lg italic">Projects</h3>
                </div>
                <div className="space-y-4">
                  {projects.map(proj => {
                    const targetId = `proj-${proj.id}`;
                    return (
                      <AssignmentTarget
                        key={targetId}
                        id={targetId}
                        title={proj.name}
                        icon={FolderKanban}
                        assignedFiles={getAssignedFiles(targetId)}
                        draggedFileId={draggedFileId}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      />
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border/50 bg-secondary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unassignedFiles.length > 0 && (
              <div className="flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-widest opacity-70">
                <AlertCircle className="w-4 h-4" />
                <span>Unassigned files will be ignored</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-6 border-border/50 text-muted-foreground hover:bg-secondary/20 hover:text-foreground transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(getEmbedGroups())}
              disabled={isSubmitting || !hasAssigned}
              className="rounded-full px-8 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Cultivating...
                </>
              ) : (
                'Confirm Embed'
              )}
            </Button>
          </div>
        </div>

      </Card>
    </div>
  );
}
