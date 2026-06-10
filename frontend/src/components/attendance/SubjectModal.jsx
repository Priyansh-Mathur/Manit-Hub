import { useEffect, useState } from "react";
import { CalendarCheck, X, AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const emptyForm = { name: "", attended: "", held: "", target: "75" };

/** Add a new subject, or edit counts/target when `subject` is provided. */
export default function SubjectModal({ open, subject, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        subject
          ? {
              name: subject.name,
              attended: String(subject.attended),
              held: String(subject.held),
              target: String(subject.target),
            }
          : emptyForm
      );
      setError("");
    }
  }, [open, subject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const attended = Number(form.attended) || 0;
    const held = Number(form.held) || 0;
    if (attended > held) {
      setError("Attended classes can't exceed classes held.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: form.name,
        attended,
        held,
        target: Number(form.target) || 75,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={CalendarCheck}
      title={subject ? "Edit subject" : "Add a subject"}
      description={
        subject
          ? "Fix counts or change your attendance target."
          : "Start tracking attendance for a subject."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Subject name <span className="text-accent-600">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Digital Electronics"
            className="field"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Attended
            </label>
            <input
              type="number"
              min="0"
              value={form.attended}
              onChange={(e) => setForm({ ...form, attended: e.target.value })}
              placeholder="0"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Held
            </label>
            <input
              type="number"
              min="0"
              value={form.held}
              onChange={(e) => setForm({ ...form, held: e.target.value })}
              placeholder="0"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Target %
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              className="field"
            />
          </div>
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
          <Button type="submit" fullWidth loading={loading}>
            {subject ? "Save changes" : "Add subject"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
