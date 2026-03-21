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
      return <CheckCircle2 className="w-4 h-4 text-primary" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500/60" />;
    case 'pending':
    default:
      return <Clock className="w-4 h-4 text-muted-foreground/60" />;
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
    <div className="rounded-[2rem] border border-border/50 bg-card shadow-xl shadow-primary/5 overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/30">
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="py-6 px-8 text-foreground font-serif italic text-sm">Document Name</TableHead>
            <TableHead className="py-6 px-8 text-foreground font-serif italic text-sm">Status</TableHead>
            <TableHead className="py-6 px-8 text-foreground font-serif italic text-sm">Last Cultivated</TableHead>
            <TableHead className="py-6 px-8 text-foreground font-serif italic text-sm text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs uppercase tracking-[0.2em] font-bold">Discovering documents...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : !documents || documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                  <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 opacity-40 text-primary" />
                  </div>
                  <p className="text-xl font-serif italic text-foreground/60">No documents found</p>
                  <p className="text-sm mt-2 font-light">Add documents from Google Drive to begin cultivating insight.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id} className="border-border/40 hover:bg-secondary/20 transition-colors group">
                <TableCell className="py-6 px-8 font-medium text-foreground flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                    <FileText className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{doc.file_name}</div>
                    <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">PDF Document</div>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-8">
                  <Badge 
                    variant={getStateVariant(doc.state)}
                    className="rounded-full px-4 py-1.5 flex items-center gap-2 bg-background border-border/50 text-[10px] items-center gap-2"
                  >
                    {getStateIcon(doc.state)}
                    <span className="capitalize">{doc.state}</span>
                  </Badge>
                </TableCell>
                <TableCell className="py-6 px-8 text-muted-foreground font-light text-xs">
                  {new Date(doc.updated_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell className="py-6 px-8 text-right">
                  <Button variant="ghost" size="sm" className="rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-primary/10 hover:text-primary">
                    View Segment
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
