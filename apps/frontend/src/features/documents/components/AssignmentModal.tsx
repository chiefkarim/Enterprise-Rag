import { X, FileText, GripVertical, Building2, FolderKanban, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/features/projects/api/projectsApi';
import { getDepartments } from '@/features/departments/api/departmentsApi';
import { useDocumentAssignment } from '../hooks/useDocumentAssignment';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export interface FileItem {
  id: string;
  name: string;
}

export interface EmbedGroup {
  department?: string;
  project_id?: string;
  files: FileItem[];
}

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
          
          {/* Left Column: Unassigned Files */}
          <div className="w-full lg:w-1/3 flex flex-col border-r border-border bg-white/[0.02]">
            <div className="p-4 border-b border-border bg-white/5">
              <h3 className="font-semibold text-white flex items-center justify-between">
                <span>Unassigned Files</span>
                <Badge variant="default">{unassignedFiles.length}</Badge>
              </h3>
            </div>
            
            <div 
              className={`flex-1 overflow-y-auto p-4 space-y-2 transition-colors duration-200 ${draggedFileId ? 'bg-primary/5' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'unassigned')}
            >
              {unassignedFiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-3 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm">All files assigned!</p>
                </div>
              ) : (
                unassignedFiles.map(file => (
                  <div
                    key={file.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file.id)}
                    onDragEnd={handleDragEnd}
                    className="group bg-white/5 border border-border hover:border-primary/50 rounded-lg p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all hover:bg-white/10"
                  >
                    <GripVertical className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm text-white/90 truncate flex-1" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

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
                    const assignedList = getAssignedFiles(targetId);
                    
                    return (
                      <div 
                        key={targetId}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, targetId)}
                        className={`border rounded-xl p-4 transition-all duration-200 
                          ${draggedFileId ? 'border-primary/30 bg-primary/10' : 'border-white/10 bg-white/5'}
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white/90 capitalize">{dept.name}</h4>
                          <Badge variant="default">{assignedList.length}</Badge>
                        </div>
                        <div className="space-y-1.5 min-h-[40px] rounded-lg p-1">
                          {assignedList.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-xs text-white/50">Drop files here</span>
                            </div>
                          ) : (
                            assignedList.map(f => (
                              <div
                                key={f.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, f.id)}
                                onDragEnd={handleDragEnd}
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
                    const assignedList = getAssignedFiles(targetId);
                    
                    return (
                      <div 
                        key={targetId}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, targetId)}
                        className={`border rounded-xl p-4 transition-all duration-200 
                          ${draggedFileId ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/10 bg-white/5'}
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white/90 truncate pr-2" title={proj.name}>{proj.name}</h4>
                          <Badge variant="default">{assignedList.length}</Badge>
                        </div>
                        <div className="space-y-1.5 min-h-[40px] rounded-lg p-1">
                          {assignedList.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-xs text-white/50">Drop files here</span>
                            </div>
                          ) : (
                            assignedList.map(f => (
                              <div
                                key={f.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, f.id)}
                                onDragEnd={handleDragEnd}
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
