import { useState } from "react";
import { CarFront, X, AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const emptyForm = {
  from: "",
  to: "",
  departureAt: "",
  seatsTotal: "3",
  note: "",
};

export default function PostRideModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(form.departureAt) <= new Date()) {
      setError("Departure must be in the future.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        seatsTotal: Number(form.seatsTotal),
        departureAt: new Date(form.departureAt).toISOString(),
      });
      setForm(emptyForm);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={CarFront}
      title="Post a ride"
      description="Split the fare — find co-passengers from campus."
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              From <span className="text-accent-600">*</span>
            </label>
            <input
              type="text"
              required
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              placeholder="e.g. MANIT main gate"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              To <span className="text-accent-600">*</span>
            </label>
            <input
              type="text"
              required
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              placeholder="e.g. Bhopal Junction"
              className="field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Departure <span className="text-accent-600">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={form.departureAt}
              onChange={(e) => setForm({ ...form, departureAt: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Seats for others <span className="text-accent-600">*</span>
            </label>
            <select
              value={form.seatsTotal}
              onChange={(e) => setForm({ ...form, seatsTotal: e.target.value })}
              className="field"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "seat" : "seats"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Note
          </label>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="e.g. Booking an Uber XL, luggage space available"
            rows="2"
            maxLength={300}
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
          <Button type="submit" fullWidth loading={loading}>
            Post ride
          </Button>
        </div>
      </form>
    </Modal>
  );
}
