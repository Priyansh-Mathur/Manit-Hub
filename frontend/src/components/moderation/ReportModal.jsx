import { useState } from "react";
import { Flag, X, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { reportContent } from "../../api/reports";
import { useToast } from "../ui/useToast";

const PRESETS = [
  "Spam or misleading",
  "Harassment or hate",
  "Inappropriate content",
  "Scam or fraud",
  "Other",
];

/** Shared "report this content" dialog for any targetType/targetId. */
export default function ReportModal({ open, onClose, targetType, targetId, title }) {
  const [preset, setPreset] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { show } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const reason = [preset, details.trim()].filter(Boolean).join(" — ");
      await reportContent({ targetType, targetId, reason });
      show("Reported — a moderator will review it", "success");
      setPreset("");
      setDetails("");
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      icon={Flag}
      title="Report content"
      description={title}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Why are you reporting this? <span className="text-accent-600">*</span>
          </label>
          <div className="space-y-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={cn(
                  "ring-focus block w-full rounded-xl border px-3.5 py-2 text-left text-sm transition",
                  preset === p
                    ? "border-primary-600 bg-primary-600/10 font-medium text-primary-700 dark:text-primary-200"
                    : "bg-surface text-muted hover:text-fg"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Anything that helps the moderators…"
            rows="2"
            maxLength={250}
            className="field resize-none"
          />
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
            onClick={onClose}
            leftIcon={X}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={loading} disabled={!preset}>
            Submit report
          </Button>
        </div>
      </form>
    </Modal>
  );
}
