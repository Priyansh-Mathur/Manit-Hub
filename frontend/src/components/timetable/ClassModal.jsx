import { useEffect, useState } from "react";
import { CalendarDays, X, AlertCircle, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { DAY_NAMES } from "./constants";

const emptyForm = {
  subject: "",
  dayOfWeek: "1",
  startTime: "",
  endTime: "",
  room: "",
  professor: "",
};

/** Add a class, or edit/delete when `entry` is provided. */
export default function ClassModal({ open, entry, onClose, onSubmit, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        entry
          ? {
              subject: entry.subject,
              dayOfWeek: String(entry.dayOfWeek),
              startTime: entry.startTime,
              endTime: entry.endTime,
              room: entry.room || "",
              professor: entry.professor || "",
            }
          : emptyForm
      );
      setError("");
    }
  }, [open, entry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.endTime <= form.startTime) {
      setError("Class must end after it starts.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...form, dayOfWeek: Number(form.dayOfWeek) });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={CalendarDays}
      title={entry ? "Edit class" : "Add a class"}
      description="Class reminders arrive ~30 minutes before start."
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Subject <span className="text-accent-600">*</span>
          </label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="e.g. Digital Electronics"
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Day <span className="text-accent-600">*</span>
          </label>
          <select
            value={form.dayOfWeek}
            onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            className="field"
          >
            {DAY_NAMES.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Starts <span className="text-accent-600">*</span>
            </label>
            <input
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Ends <span className="text-accent-600">*</span>
            </label>
            <input
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="field"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Room
            </label>
            <input
              type="text"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              placeholder="e.g. NTB-204"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Professor
            </label>
            <input
              type="text"
              value={form.professor}
              onChange={(e) => setForm({ ...form, professor: e.target.value })}
              placeholder="e.g. Dr. Sharma"
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
          {entry && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                onDelete?.(entry);
                onClose();
              }}
              leftIcon={Trash2}
            >
              Delete
            </Button>
          )}
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
            {entry ? "Save changes" : "Add class"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
