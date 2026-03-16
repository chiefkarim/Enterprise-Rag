import { useState, useEffect } from 'react';
import type { FileItem, EmbedGroup } from '../types';

export function useDocumentAssignment(files: FileItem[], isOpen: boolean) {
  const [fileAssignments, setFileAssignments] = useState<Record<string, string>>({});
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      files.forEach(f => {
        initial[f.id] = 'unassigned';
      });
      setFileAssignments(initial);
    }
  }, [isOpen, files]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedFileId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && files.some(f => f.id === id)) {
      setFileAssignments(prev => ({ ...prev, [id]: targetId }));
    }
    setDraggedFileId(null);
  };

  const handleDragEnd = () => {
    setDraggedFileId(null);
  };

  const getUnassignedFiles = () => files.filter(f => fileAssignments[f.id] === 'unassigned' || !fileAssignments[f.id]);
  const getAssignedFiles = (targetId: string) => files.filter(f => fileAssignments[f.id] === targetId);

  const getEmbedGroups = () => {
    const deptGroups: Record<string, FileItem[]> = {};
    const projGroups: Record<string, FileItem[]> = {};
    
    files.forEach(f => {
      const target = fileAssignments[f.id];
      if (!target || target === 'unassigned') return;
      
      if (target.startsWith('dept-')) {
        const dept = target.replace('dept-', '');
        if (!deptGroups[dept]) deptGroups[dept] = [];
        deptGroups[dept].push(f);
      } else if (target.startsWith('proj-')) {
        const projId = target.replace('proj-', '');
        if (!projGroups[projId]) projGroups[projId] = [];
        projGroups[projId].push(f);
      }
    });

    const result: EmbedGroup[] = [];
    Object.entries(deptGroups).forEach(([dept, fb]) => {
      if (fb.length > 0) result.push({ department: dept, files: fb });
    });
    Object.entries(projGroups).forEach(([projId, fb]) => {
      if (fb.length > 0) result.push({ project_id: projId, files: fb });
    });

    return result;
  };

  return {
    fileAssignments,
    draggedFileId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    getUnassignedFiles,
    getAssignedFiles,
    getEmbedGroups
  };
}
