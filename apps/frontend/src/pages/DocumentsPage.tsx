import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/features/documents/api/documentsApi';
import AssignmentModal from '@/features/documents/components/AssignmentModal';
import { DocumentTable } from '@/features/documents/components/DocumentTable';
import { useDocumentActions } from '@/features/documents/hooks/useDocumentActions';
import { Button } from '@/components/ui/Button';

export default function DocumentsPage() {
  const {
    isSubmitting,
    isAssigning,
    pickedFiles,
    setIsAssigning,
    handleOpenPicker,
    handleAssignmentSubmit,
  } = useDocumentActions();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-serif italic font-medium text-foreground tracking-tight">Workspace Documents</h2>
          <p className="text-muted-foreground text-lg mt-2 font-light leading-relaxed">
            Manage the organic knowledge segments available for semantic search.
          </p>
          <div className="text-primary text-[10px] uppercase tracking-widest mt-6 flex items-center gap-3 bg-primary/5 w-fit px-4 py-2.5 rounded-full border border-primary/20 font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Service Account: <span className="font-mono text-foreground/80 selection:bg-primary/30">enterprise-rag@enterprise-rag-489707.iam.gserviceaccount.com</span>
          </div>
        </div>
        <Button
          onClick={handleOpenPicker}
          disabled={isSubmitting}
          className="flex items-center gap-3 px-8 py-6 rounded-full font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Cultivating...
            </>
          ) : (
            'Add from Google Drive'
          )}
        </Button>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <DocumentTable documents={documents} isLoading={isLoading} />
      </div>

      <AssignmentModal
        isOpen={isAssigning}
        files={pickedFiles}
        onClose={() => setIsAssigning(false)}
        onSubmit={handleAssignmentSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
