import { useState } from "react";
import { HelpCircle, X, AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { BRANCHES, SEMESTERS } from "../studyVault/constants";

const emptyForm = {
  title: "",
  body: "",
  branch: "",
  subject: "",
  semester: "",
};

export default function AskQuestionModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
      setForm(emptyForm);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={HelpCircle}
      title="Ask a question"
      description="Stuck on a concept? Your campus has answers."
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Question <span className="text-accent-600">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={150}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. How does Banker's algorithm avoid deadlock?"
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Details
          </label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="What have you tried? Where exactly are you stuck?"
            rows="4"
            maxLength={3000}
            className="field resize-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Branch
            </label>
            <select
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="field"
            >
              <option value="">Any branch</option>
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
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Operating Systems"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Semester
            </label>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="field"
            >
              <option value="">Any</option>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
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
            Post question
          </Button>
        </div>
      </form>
    </Modal>
  );
}
