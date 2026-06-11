import { useState } from "react";
import {
  Download,
  Trash2,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Presentation,
  ArrowBigUp,
  MessageSquareText,
  Eye,
  Flag,
} from "lucide-react";
import { cn } from "../../lib/cn";
import {
  trackDownload,
  deleteDocument,
  toggleDocumentUpvote,
} from "../../api/documents";
import DocCommentsModal from "./DocCommentsModal";
import DocPreviewModal from "./DocPreviewModal";
import ReportModal from "../moderation/ReportModal";
import { useAuthContext } from "../../context/useAuthContext";
import { useToast } from "../ui/useToast";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import { formatFileSize, isPreviewable } from "./constants";

const typeTone = {
  Notes: "primary",
  PYQ: "gold",
  Syllabus: "success",
  "Sem Schedule": "accent",
  Other: "neutral",
};

const formatIcon = (format) => {
  if (["png", "jpg", "jpeg", "webp"].includes(format)) return FileImage;
  if (["xls", "xlsx", "csv"].includes(format)) return FileSpreadsheet;
  if (["zip", "rar"].includes(format)) return FileArchive;
  if (["ppt", "pptx"].includes(format)) return Presentation;
  return FileText;
};

export default function DocumentCard({ doc, onDeleted }) {
  const { user } = useAuthContext();
  const { show } = useToast();
  const [downloadCount, setDownloadCount] = useState(doc.downloadCount || 0);
  const [downloading, setDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(doc.upvoteCount || 0);
  const [myUpvote, setMyUpvote] = useState(!!doc.myUpvote);
  const [comments, setComments] = useState(doc.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const isOwner = user && doc.uploader?._id === user._id;

  const handleUpvote = async () => {
    // Optimistic toggle; reconcile with the server's answer.
    setMyUpvote((v) => !v);
    setUpvoteCount((c) => (myUpvote ? c - 1 : c + 1));
    try {
      const result = await toggleDocumentUpvote(doc._id);
      if (result) {
        setMyUpvote(result.myUpvote);
        setUpvoteCount(result.upvoteCount);
      }
    } catch (error) {
      console.error("Upvote failed:", error);
      setMyUpvote((v) => !v);
      setUpvoteCount(doc.upvoteCount || 0);
      show("Could not upvote", "error");
    }
  };

  const FileIcon = formatIcon((doc.fileFormat || "").toLowerCase());

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await trackDownload(doc._id);
      if (result?.downloadCount != null) setDownloadCount(result.downloadCount);
      window.open(result?.fileUrl || doc.fileUrl, "_blank", "noopener");
    } catch (error) {
      console.error("Download failed:", error);
      show("Could not download file", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(doc._id);
      show("Document deleted", "success");
      if (onDeleted) onDeleted(doc._id);
    } catch (error) {
      console.error("Error deleting document:", error);
      show("Failed to delete document", "error");
    }
  };

  return (
    <div className="group flex flex-col rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600">
          <FileIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug text-fg line-clamp-2">
            {doc.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted">
            {[doc.subject, doc.fileFormat?.toUpperCase(), formatFileSize(doc.fileSize)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      {doc.description && (
        <p className="mt-3 text-sm text-muted line-clamp-2">{doc.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={typeTone[doc.type] || "neutral"}>{doc.type}</Badge>
        {doc.branch && <Badge tone="neutral">{doc.branch}</Badge>}
        {doc.semester && <Badge tone="neutral">Sem {doc.semester}</Badge>}
        {doc.type === "PYQ" && doc.year && <Badge tone="neutral">{doc.year}</Badge>}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            src={doc.uploader?.avatarUrl}
            name={doc.uploader?.displayName || "Student"}
            size="xs"
          />
          <span className="truncate text-sm font-medium text-fg">
            {doc.uploader?.displayName || "Unknown"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={handleUpvote}
            aria-label={myUpvote ? "Remove upvote" : "Upvote document"}
            className={cn(
              "ring-focus inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-xs font-semibold transition",
              myUpvote
                ? "border-primary-600 bg-primary-600/10 text-primary-600"
                : "text-muted hover:text-fg"
            )}
          >
            <ArrowBigUp size={14} className={myUpvote ? "fill-current" : ""} />
            {upvoteCount}
          </button>
          <button
            type="button"
            onClick={() => setShowComments(true)}
            aria-label="View comments"
            className="ring-focus inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold text-muted transition hover:text-fg"
          >
            <MessageSquareText size={12} />
            {comments.length}
          </button>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Download size={13} /> {downloadCount}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {isPreviewable(doc.fileFormat) && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            aria-label="Preview document"
            title="Preview in app"
            className="ring-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-surface text-muted transition hover:border-primary-500/40 hover:text-primary-600"
          >
            <Eye size={15} />
          </button>
        )}
        <Button
          size="sm"
          fullWidth
          leftIcon={Download}
          loading={downloading}
          onClick={handleDownload}
        >
          Download
        </Button>
        {isOwner ? (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete document"
            className="ring-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-danger-500/30 text-danger-600 transition hover:bg-danger-500/10"
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowReport(true)}
            aria-label="Report document"
            title="Report document"
            className="ring-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-muted transition hover:text-warning-600"
          >
            <Flag size={14} />
          </button>
        )}
      </div>

      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        targetType="document"
        targetId={doc._id}
        title={doc.title}
      />

      <DocPreviewModal
        doc={doc}
        open={showPreview}
        onClose={() => setShowPreview(false)}
        downloading={downloading}
        onDownload={handleDownload}
      />

      <DocCommentsModal
        doc={{ ...doc, comments }}
        open={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={(id, created) =>
          setComments((prev) => [...prev, created])
        }
      />

      <ConfirmModal
        open={showDeleteModal}
        title="Delete document?"
        description="This will remove the document from Study Vault permanently."
        confirmText="Delete"
        tone="danger"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDelete();
        }}
      />
    </div>
  );
}
