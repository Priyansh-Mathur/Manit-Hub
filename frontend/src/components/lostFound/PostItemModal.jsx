import { useState, useRef } from "react";
import { SearchCheck, Upload, X, AlertCircle, ImageIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { resizeImages } from "../../lib/resizeImage";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { LF_CATEGORIES } from "./constants";

const emptyForm = {
  title: "",
  kind: "lost",
  category: "",
  location: "",
  description: "",
};

export default function PostItemModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resized = await resizeImages(files, 1000);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") payload.append(key, value);
      });
      resized.forEach((file) => payload.append("images", file, file.name || "image.jpg"));

      await onSubmit(payload);

      setFormData(emptyForm);
      setFiles([]);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post item");
      console.error("Error posting item:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={SearchCheck}
      title="Post to Lost & Found"
      description="Lost something? Found something? Let your campus know."
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            I have… <span className="text-accent-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "lost", label: "Lost an item" },
              { value: "found", label: "Found an item" },
            ].map((opt) => {
              const active = formData.kind === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, kind: opt.value })}
                  className={cn(
                    "ring-focus rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "border-primary-600 bg-primary-600/10 text-primary-700 dark:text-primary-200"
                      : "bg-surface text-muted hover:text-fg"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Title <span className="text-accent-600">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Black JBL earbuds in a blue case"
            className="field"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Category <span className="text-accent-600">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="field"
            >
              <option value="">Select category</option>
              {LF_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Last seen / found at
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. NTB lecture hall 3"
              className="field"
            />
          </div>
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
            placeholder="Anything that helps identify it — marks, stickers, contents…"
            rows="3"
            className="field resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Photos (up to 4)
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="ring-focus flex w-full flex-col items-center rounded-2xl border-2 border-dashed bg-bg p-5 text-center transition hover:border-primary-500/50"
          >
            <Upload className="mb-2 h-6 w-6 text-muted" />
            <p className="text-sm font-medium text-fg">Click to add photos</p>
            <p className="mt-0.5 text-xs text-muted">JPG, PNG or WEBP — up to 10MB each</p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) =>
              setFiles([...e.target.files].slice(0, 4))
            }
          />

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl border bg-surface px-3.5 py-2"
                >
                  <ImageIcon className="h-4 w-4 shrink-0 text-primary-600" />
                  <p className="min-w-0 flex-1 truncate text-sm text-fg">
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles(files.filter((_, i) => i !== index))
                    }
                    aria-label="Remove photo"
                    className="ring-focus rounded-lg p-1 text-muted transition hover:text-fg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
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
            disabled={!formData.category}
          >
            {loading ? "Posting…" : "Post item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
