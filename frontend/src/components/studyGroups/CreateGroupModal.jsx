import { useState } from "react";
import { Users, AlertCircle, Plus } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const subjects = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Other",
];

const buildInitialFormData = (initialData) => ({
  name: initialData?.name || "",
  description: initialData?.description || "",
  subject: initialData?.subject || "",
  tags: (initialData?.tags || []).join(", "),
  maxMembers: initialData?.maxMembers || 10,
  nextSessionAt: initialData?.nextSession?.at
    ? new Date(initialData.nextSession.at).toISOString().slice(0, 16)
    : "",
  nextSessionMode: initialData?.nextSession?.mode || "online",
  nextSessionLocation: initialData?.nextSession?.location || "",
  nextSessionMeetingLink: initialData?.nextSession?.meetingLink || "",
  links: {
    whatsapp: initialData?.links?.whatsapp || "",
    telegram: initialData?.links?.telegram || "",
    discord: initialData?.links?.discord || "",
    googleMeet: initialData?.links?.googleMeet || "",
  },
  customLinks: initialData?.customLinks?.length
    ? initialData.customLinks.map((link) => ({
        label: link.label || "",
        url: link.url || "",
      }))
    : [{ label: "", url: "" }],
});

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitLabel = "Create group",
}) {
  const [formData, setFormData] = useState(() => buildInitialFormData(initialData));
  const [coverFile, setCoverFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

    const data = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      links: {
        whatsapp: formData.links.whatsapp || undefined,
        telegram: formData.links.telegram || undefined,
        discord: formData.links.discord || undefined,
        googleMeet: formData.links.googleMeet || undefined,
      },
      customLinks: formData.customLinks
        .map((link) => ({ label: link.label?.trim(), url: link.url?.trim() }))
        .filter((link) => link.label || link.url),
      nextSession: formData.nextSessionAt
        ? {
            at: formData.nextSessionAt,
            mode: formData.nextSessionMode,
            location: formData.nextSessionLocation,
            meetingLink: formData.nextSessionMeetingLink,
          }
        : undefined,
    };

    Promise.resolve(onSubmit({ data, coverFile }))
      .then(() => {
        setFormData(buildInitialFormData());
        setCoverFile(null);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to save study group");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      icon={Users}
      title={initialData ? "Edit study group" : "Create study group"}
      description="Set the details and how members can connect."
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Group name <span className="text-accent-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Subject <span className="text-accent-600">*</span>
            </label>
            <select
              required
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="field"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
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
            className="field resize-none"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="algorithms, exam prep"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Max members
            </label>
            <input
              type="number"
              min="2"
              max="50"
              value={formData.maxMembers}
              onChange={(e) =>
                setFormData({ ...formData, maxMembers: parseInt(e.target.value, 10) })
              }
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Next session
            </label>
            <input
              type="datetime-local"
              value={formData.nextSessionAt}
              onChange={(e) =>
                setFormData({ ...formData, nextSessionAt: e.target.value })
              }
              className="field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">Mode</label>
            <select
              value={formData.nextSessionMode}
              onChange={(e) =>
                setFormData({ ...formData, nextSessionMode: e.target.value })
              }
              className="field"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Location
            </label>
            <input
              type="text"
              value={formData.nextSessionLocation}
              onChange={(e) =>
                setFormData({ ...formData, nextSessionLocation: e.target.value })
              }
              className="field"
              placeholder="Central Library, Room 204"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Meeting link
            </label>
            <input
              type="url"
              value={formData.nextSessionMeetingLink}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nextSessionMeetingLink: e.target.value,
                })
              }
              className="field"
              placeholder="meet.google.com/…"
            />
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <h3 className="mb-3 text-sm font-semibold text-fg">Connection links</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { key: "whatsapp", label: "WhatsApp", ph: "https://chat.whatsapp.com/…" },
              { key: "telegram", label: "Telegram", ph: "https://t.me/…" },
              { key: "discord", label: "Discord", ph: "https://discord.gg/…" },
              { key: "googleMeet", label: "Google Meet", ph: "https://meet.google.com/…" },
            ].map((f) => (
              <div key={f.key}>
                <label className="mb-1.5 block text-sm font-medium text-fg">
                  {f.label}
                </label>
                <input
                  type="url"
                  value={formData.links[f.key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      links: { ...formData.links, [f.key]: e.target.value },
                    })
                  }
                  className="field"
                  placeholder={f.ph}
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium text-fg">Custom links</h4>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    customLinks: [...formData.customLinks, { label: "", url: "" }],
                  })
                }
                className="ring-focus inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 transition hover:text-primary-700"
              >
                <Plus size={12} /> Add link
              </button>
            </div>
            <div className="space-y-2">
              {formData.customLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 md:grid-cols-5">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const next = [...formData.customLinks];
                      next[index] = { ...next[index], label: e.target.value };
                      setFormData({ ...formData, customLinks: next });
                    }}
                    className="field md:col-span-2"
                    placeholder="Label"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const next = [...formData.customLinks];
                      next[index] = { ...next[index], url: e.target.value };
                      setFormData({ ...formData, customLinks: next });
                    }}
                    className="field md:col-span-3"
                    placeholder="https://…"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Cover image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="field file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700"
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
            size="lg"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            {submitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
