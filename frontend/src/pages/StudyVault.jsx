import { useEffect, useState } from "react";
import { Library, Plus, FileSearch } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import DocumentFilters from "../components/studyVault/DocumentFilters";
import DocumentCard from "../components/studyVault/DocumentCard";
import UploadDocModal from "../components/studyVault/UploadDocModal";
import { fetchDocuments, uploadDocument } from "../api/documents";
import { useToast } from "../components/ui/useToast";

function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-9 w-full" />
    </div>
  );
}

export default function StudyVault() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { show } = useToast();

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const response = await fetchDocuments({ ...filters, page, limit: 12 });
        if (Array.isArray(response.items)) {
          setDocuments(response.items);
          setMeta(response.meta);
        } else {
          setDocuments([]);
          setMeta(null);
        }
      } catch (err) {
        console.error("Failed to fetch documents", err);
        setDocuments([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, [filters, page, refreshTrigger]);

  const handleUpload = async (formData) => {
    await uploadDocument(formData);
    show("Document uploaded", "success");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleted = (id) => {
    setDocuments((prev) => prev.filter((d) => d._id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notes & PYQs"
        title="Study Vault"
        subtitle="Notes, previous year questions & study material from your campus."
        icon={Library}
        actions={
          <Button leftIcon={Plus} onClick={() => setShowUpload(true)}>
            Upload document
          </Button>
        }
      />

      <DocumentFilters onFiltersChange={setFilters} />

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No documents found"
          description="Try a different search or filter — or be the first to share your notes."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            Showing{" "}
            <span className="font-semibold text-fg">{documents.length}</span>{" "}
            {documents.length === 1 ? "result" : "results"}
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} doc={doc} onDeleted={handleDeleted} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(meta.totalPages, prev + 1))
                }
                disabled={page >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <UploadDocModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleUpload}
      />
    </div>
  );
}
