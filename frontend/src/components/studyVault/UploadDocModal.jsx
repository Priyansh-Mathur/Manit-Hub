import { useState, useRef } from "react";
import { Upload, BookOpen, X, AlertCircle, FileText } from "lucide-react";
import { cn } from "../../lib/cn";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { DOC_TYPES, BRANCHES, SEMESTERS, formatFileSize } from "./constants";

const ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp,.zip";

const emptyForm = {
  title: "",
  type: "",
  branch: "",
  subject: "",
  semester: "",
  year: "",
  description: "",
};

export default function UploadDocModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedFile) {
      setError("Please choose a file to upload");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("file", selectedFile);
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") payload.append(key, value);
      });

      await onSubmit(payload);

      setFormData(emptyForm);
      setSelectedFile(null);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload document");
      console.error("Error uploading document:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      icon={BookOpen}
      title="Upload a document"
      description="Share notes, PYQs & more with your campus."
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Title <span className="text-accent-600">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. DSA Unit 3 — Trees & Graphs"
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Type <span className="text-accent-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {DOC_TYPES.map((type) => {
              const active = formData.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={cn(
                    "ring-focus rounded-xl border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-primary-600 bg-primary-600/10 text-primary-700 dark:text-primary-200"
                      : "bg-surface text-muted hover:text-fg"
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Branch
            </label>
            <select
              value={formData.branch}
              onChange={(e) =>
                setFormData({ ...formData, branch: e.target.value })
              }
              className="field"
            >
              <option value="">Select branch</option>
              {BRANCHES.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="e.g. Data Structures"
              className="field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Semester
            </label>
            <select
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: e.target.value })
              }
              className="field"
            >
              <option value="">Select semester</option>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {formData.type === "PYQ" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg">
                Exam year
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                placeholder="e.g. 2025"
                className="field"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="What does this document cover?"
            rows="3"
            className="field resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            File <span className="text-accent-600">*</span>
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="ring-focus flex w-full flex-col items-center rounded-2xl border-2 border-dashed bg-bg p-6 text-center transition hover:border-primary-500/50"
          >
            <Upload className="mb-2 h-7 w-7 text-muted" />
            <p className="text-sm font-medium text-fg">Click to choose a file</p>
            <p className="mt-0.5 text-xs text-muted">
              PDF, DOCX, PPTX, XLSX, TXT, images or ZIP — up to 20MB
            </p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />

          {selectedFile && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border bg-surface px-3.5 py-2.5">
              <FileText className="h-5 w-5 shrink-0 text-primary-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                aria-label="Remove file"
                className="ring-focus rounded-lg p-1 text-muted transition hover:text-fg"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-sm text-danger-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            size="lg"
            onClick={onClose}
            leftIcon={X}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            disabled={!formData.type}
          >
            {loading ? "Uploading…" : "Upload document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
