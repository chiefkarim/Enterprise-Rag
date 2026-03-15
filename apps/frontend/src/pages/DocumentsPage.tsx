import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { getDocuments } from '@/features/documents/api/documentsApi';

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

function getStateStyles(state: string) {
  switch (state) {
    case 'embedded':
      return 'bg-green-500/10 text-green-400 border border-green-500/20';
    case 'failed':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'pending':
    default:
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  }
}

export default function DocumentsPage() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Workspace Documents</h2>
          <p className="text-sm text-white/50 mt-1">
            View and manage documents available for semantic search.
          </p>
        </div>
        <button
          className="px-4 py-2 bg-gradient-to-r from-[#5DD7AD] to-[#3ab88e] hover:from-[#4cc69c] hover:to-[#2aa77d] text-[#0a1628] font-medium rounded-lg shadow-lg shadow-[#5DD7AD]/20 transition-all duration-200"
        >
          Add from Google Drive
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 border-b border-white/10 text-xs uppercase text-white/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Document Name</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium">Last Updated</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/40">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#5DD7AD] border-t-transparent rounded-full animate-spin" />
                      Loading documents...
                    </div>
                  </td>
                </tr>
              ) : documents?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-white/40">
                      <FileText className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-base font-medium text-white/60">No documents found</p>
                      <p className="text-sm mt-1">Add documents from Google Drive to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents?.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <FileText className="w-4 h-4 text-white/40" />
                      {doc.file_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStateStyles(doc.state)}`}>
                        {getStateIcon(doc.state)}
                        {doc.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/50">
                      {new Date(doc.updated_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm text-[#5DD7AD] hover:text-[#4cc69c] font-medium transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
