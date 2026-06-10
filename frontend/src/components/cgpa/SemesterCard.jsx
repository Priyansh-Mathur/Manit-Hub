import { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import ConfirmModal from "../ui/ConfirmModal";
import { GRADES, computeSgpa, formatGpa } from "./constants";

const emptySubject = { name: "", credits: "", grade: "" };

const sgpaTone = (sgpa) => {
  if (sgpa == null) return "neutral";
  if (sgpa >= 8.5) return "success";
  if (sgpa >= 7) return "primary";
  if (sgpa >= 5.5) return "warning";
  return "danger";
};

export default function SemesterCard({
  semester,
  subjects,
  dirty,
  saving,
  onChange,
  onSave,
  onDelete,
}) {
  const [showDelete, setShowDelete] = useState(false);
  const sgpa = computeSgpa(subjects);

  const updateSubject = (index, patch) => {
    onChange(
      subjects.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  };

  const removeSubject = (index) => {
    onChange(subjects.filter((_, i) => i !== index));
  };

  const complete = subjects.every(
    (s) => s.name.trim() && Number(s.credits) > 0 && s.grade
  );

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b bg-surface/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <h3 className="font-display text-base font-bold text-fg">
            Semester {semester}
          </h3>
          <Badge tone={sgpaTone(sgpa)}>SGPA {formatGpa(sgpa)}</Badge>
          {dirty && <Badge tone="warning">Unsaved</Badge>}
        </div>
        <button
          type="button"
          onClick={() => setShowDelete(true)}
          aria-label={`Remove semester ${semester}`}
          className="ring-focus rounded-lg p-1.5 text-muted transition hover:bg-danger-500/10 hover:text-danger-600"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="space-y-2.5 p-5">
        {subjects.length === 0 && (
          <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted">
            No subjects yet — add the courses you took this semester.
          </p>
        )}

        {subjects.map((subject, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={subject.name}
              onChange={(e) => updateSubject(index, { name: e.target.value })}
              placeholder="Subject name"
              className="field min-w-0 flex-1"
            />
            <input
              type="number"
              min="0.5"
              max="30"
              step="0.5"
              value={subject.credits}
              onChange={(e) => updateSubject(index, { credits: e.target.value })}
              placeholder="Cr."
              aria-label="Credits"
              className="field w-20 shrink-0"
            />
            <select
              value={subject.grade}
              onChange={(e) => updateSubject(index, { grade: e.target.value })}
              aria-label="Grade"
              className="field w-24 shrink-0"
            >
              <option value="">Grade</option>
              {GRADES.map(({ grade, points }) => (
                <option key={grade} value={grade}>
                  {grade} ({points})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeSubject(index)}
              aria-label="Remove subject"
              className="ring-focus shrink-0 rounded-lg p-1.5 text-muted transition hover:text-danger-600"
            >
              <X size={15} />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2 pt-1.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={Plus}
            onClick={() => onChange([...subjects, { ...emptySubject }])}
          >
            Add subject
          </Button>
          <Button
            size="sm"
            leftIcon={Save}
            loading={saving}
            disabled={!dirty || !complete}
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        title={`Remove semester ${semester}?`}
        description="All subjects and grades saved for this semester will be deleted."
        confirmText="Remove"
        tone="danger"
        onCancel={() => setShowDelete(false)}
        onConfirm={() => {
          setShowDelete(false);
          onDelete();
        }}
      />
    </Card>
  );
}
