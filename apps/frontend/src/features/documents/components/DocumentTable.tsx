import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Document } from '../types';

interface DocumentTableProps {
  documents: Document[] | undefined;
  isLoading: boolean;
}

function getStateIcon(state: string) {
  switch (state) {
    case 'embedded':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'pending':
    default:
      return <Clock className="w-4 h-4 text-amber-400" />;
  }
}

function getStateVariant(state: string): "success" | "destructive" | "warning" | "default" {
  switch (state) {
    case 'embedded':
      return 'success';
    case 'failed':
      return 'destructive';
    case 'pending':
    default:
      return 'warning';
  }
}

export function DocumentTable({ documents, isLoading }: DocumentTableProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                <div className="flex items-center justify-center gap-3 text-white/40">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading documents...
                </div>
              </TableCell>
            </TableRow>
          ) : !documents || documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center text-white/40">
                  <FileText className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-base font-medium text-white/60">No documents found</p>
                  <p className="text-sm mt-1">Add documents from Google Drive to get started.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium text-white flex items-center gap-3">
                  <FileText className="w-4 h-4 text-white/40" />
                  {doc.file_name}
                </TableCell>
                <TableCell>
                  <Badge variant={getStateVariant(doc.state)}>
                    {getStateIcon(doc.state)}
                    {doc.state}
                  </Badge>
                </TableCell>
                <TableCell className="text-white/50">
                  {new Date(doc.updated_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
