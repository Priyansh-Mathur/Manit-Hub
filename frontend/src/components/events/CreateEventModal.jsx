import { useState } from "react";
import { PartyPopper, X, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { EVENT_CATEGORIES } from "./constants";

const emptyForm = {
  title: "",
  club: "",
  category: "",
  venue: "",
  startAt: "",
  endAt: "",
  description: "",
};

export default function CreateEventModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(form.startAt) <= new Date()) {
      setError("Event must start in the future.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      });
      setForm(emptyForm);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={PartyPopper}
      title="Create an event"
      description="Fest, workshop, match or talk — put it on the campus calendar."
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Event title <span className="text-accent-600">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Technosearch '26 — Hackathon"
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Category <span className="text-accent-600">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {EVENT_CATEGORIES.map((category) => {
              const active = form.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setForm({ ...form, category })}
                  className={cn(
                    "ring-focus rounded-xl border px-2 py-2 text-xs font-medium transition",
                    active
                      ? "border-primary-600 bg-primary-600/10 text-primary-700 dark:text-primary-200"
                      : "bg-surface text-muted hover:text-fg"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Organizing club
            </label>
            <input
              type="text"
              value={form.club}
              onChange={(e) => setForm({ ...form, club: e.target.value })}
              placeholder="e.g. IEEE Student Branch"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Venue
            </label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="e.g. Seminar Hall"
              className="field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Starts <span className="text-accent-600">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Ends
            </label>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What's happening? Prizes, registration, dress code…"
            rows="3"
            maxLength={2000}
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
          <Button type="submit" fullWidth loading={loading} disabled={!form.category}>
            Create event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
