import { useState, useRef, useEffect, useMemo } from "react";
import { Upload, IndianRupee, ShoppingBag, X, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const categories = [
  "Textbooks",
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports",
  "Other",
];

const conditions = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export default function ListItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitLabel = "List item",
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "good",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      title: initialData.title || "",
      description: initialData.description || "",
      price: initialData.price ?? "",
      category: initialData.category || "",
      condition: initialData.condition || "good",
      images: initialData.images || [],
    });
  }, [initialData]);

  const previews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const listingData = { ...formData, price: parseFloat(formData.price) };
      await onSubmit({ listingData, files: selectedFiles });

      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "good",
        images: [],
      });
      setSelectedFiles([]);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save listing");
      console.error("Error saving listing:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      icon={ShoppingBag}
      title={initialData ? "Edit listing" : "List an item"}
      description="Reach students across the MANIT campus."
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
            placeholder="What are you selling?"
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Price <span className="text-accent-600">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0"
                className="field pl-11"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Condition
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {conditions.map((condition) => {
              const active = formData.condition === condition.value;
              return (
                <button
                  key={condition.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, condition: condition.value })
                  }
                  className={cn(
                    "ring-focus rounded-xl border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-primary-600 bg-primary-600/10 text-primary-700 dark:text-primary-200"
                      : "bg-surface text-muted hover:text-fg"
                  )}
                >
                  {condition.label}
                </button>
              );
            })}
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
            placeholder="Describe your item — model, age, reason for selling…"
            rows="4"
            className="field resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Photos
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="ring-focus flex w-full flex-col items-center rounded-2xl border-2 border-dashed bg-bg p-6 text-center transition hover:border-primary-500/50"
          >
            <Upload className="mb-2 h-7 w-7 text-muted" />
            <p className="text-sm font-medium text-fg">Click to upload photos</p>
            <p className="mt-0.5 text-xs text-muted">PNG, JPG up to 5MB each</p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
          />

          {(previews.length > 0 || formData.images.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {previews.length > 0
                ? previews.map((p) => (
                    <div
                      key={p.url}
                      className="relative h-20 w-20 overflow-hidden rounded-xl border"
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))
                : formData.images.map((src, i) => (
                    <div
                      key={i}
                      className="h-20 w-20 overflow-hidden rounded-xl border"
                    >
                      <img
                        src={src}
                        alt="Listing"
                        className="h-full w-full object-cover"
                      />
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
          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
