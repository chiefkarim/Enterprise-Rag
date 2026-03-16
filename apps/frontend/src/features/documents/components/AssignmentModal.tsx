import { X, Building2, FolderKanban, AlertCircle } from 'lucide-react';
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
    <div className="dark fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Assign Documents</h2>
            <p className="text-sm text-white/60 mt-1">
              Drag and drop documents to organize them into departments or projects before embedding.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content layout: 2 columns */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-[400px]">
          
          <UnassignedFileList
            files={unassignedFiles}
            draggedFileId={draggedFileId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />

          {/* Right Column: Drop Targets */}
          <div className="w-full lg:w-2/3 flex flex-col bg-[#0a1628]/50">
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Departments */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/80 pb-2 border-b border-border">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-white">Departments</h3>
                </div>
                <div className="space-y-3">
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
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/80 pb-2 border-b border-border">
                  <FolderKanban className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">Projects</h3>
                </div>
                <div className="space-y-3">
                  {projects.map(proj => {
                    const targetId = `proj-${proj.id}`;
                    return (
                      <AssignmentTarget
                        key={targetId}
                        id={targetId}
                        title={proj.name}
                        icon={FolderKanban}
                        iconClassName="text-indigo-400"
                        activeBorderClassName="border-indigo-500/30"
                        activeBgClassName="bg-indigo-500/10"
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
        <div className="px-6 py-4 border-t border-border bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unassignedFiles.length > 0 && (
              <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Unassigned files will be ignored</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(getEmbedGroups())}
              disabled={isSubmitting || !hasAssigned}
              className="px-6"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
                  Embedding...
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
