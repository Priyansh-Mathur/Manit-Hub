import { useState } from "react";
import { Eye, Download, ExternalLink, FileQuestion } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";

const IMAGE_FORMATS = ["png", "jpg", "jpeg", "webp"];

export default function DocPreviewModal({ doc, open, onClose, onDownload, downloading }) {
  const [loaded, setLoaded] = useState(false);
  const format = (doc.fileFormat || "").toLowerCase();
  const isImage = IMAGE_FORMATS.includes(format);
  const isPdf = format === "pdf";

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      icon={Eye}
      title={doc.title}
      description={[doc.subject, format.toUpperCase()].filter(Boolean).join(" · ")}
      bodyClassName="flex flex-col"
    >
      <div className="relative min-h-[55vh] flex-1 bg-bg">
        {!loaded && (isImage || isPdf) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {isImage && (
          <div className="flex h-full max-h-[65vh] items-center justify-center overflow-auto p-4">
            <img
              src={doc.fileUrl}
              alt={doc.title}
              onLoad={() => setLoaded(true)}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
          </div>
        )}

        {isPdf && (
          <iframe
            src={doc.fileUrl}
            title={doc.title}
            onLoad={() => setLoaded(true)}
            className="h-[65vh] w-full border-0"
          />
        )}

        {!isImage && !isPdf && (
          <EmptyState
            icon={FileQuestion}
            title="No inline preview"
            description={`${format.toUpperCase() || "This"} files can't be previewed in the app yet — download to view.`}
            className="m-6"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="ring-focus inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted transition hover:text-fg"
        >
          <ExternalLink size={14} /> Open in new tab
        </a>
        <Button size="sm" leftIcon={Download} loading={downloading} onClick={onDownload}>
          Download
        </Button>
      </div>
    </Modal>
  );
}
