import { useState } from "react";
import { Check, X, Trash2, Undo2, Settings2 } from "lucide-react";
import { cn } from "../../lib/cn";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import {
  percentage,
  skippableClasses,
  classesToRecover,
} from "./attendanceMath";

const ringTone = (pct, target) => {
  if (pct == null) return "text-muted";
  if (pct >= target) return "text-success-600";
  if (pct >= target - 10) return "text-warning-600";
  return "text-danger-600";
};

function ProgressRing({ pct, target }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const filled = pct == null ? 0 : Math.min(pct, 100) / 100;

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          strokeWidth="6"
          className="stroke-current text-muted/15"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled)}
          className={cn("stroke-current transition-all", ringTone(pct, target))}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-sm font-bold",
          ringTone(pct, target)
        )}
      >
        {pct == null ? "—" : `${Math.round(pct)}%`}
      </span>
    </div>
  );
}

export default function SubjectCard({ subject, busy, canUndo, onAction, onEdit, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  const { name, attended, held, target } = subject;
  const pct = percentage(attended, held);
  const skippable = skippableClasses(attended, held, target);
  const recover = classesToRecover(attended, held, target);
  const onTrack = pct == null || pct >= target;

  return (
    <Card padded={false} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold text-fg">
            {name}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {attended}/{held} classes attended · target ≥{target}%
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${name}`}
            className="ring-focus rounded-lg p-1.5 text-muted transition hover:bg-muted/10 hover:text-fg"
          >
            <Settings2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            aria-label={`Delete ${name}`}
            className="ring-focus rounded-lg p-1.5 text-muted transition hover:bg-danger-500/10 hover:text-danger-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <ProgressRing pct={pct} target={target} />
        <div className="min-w-0 flex-1">
          {pct == null ? (
            <p className="text-sm text-muted">
              No classes marked yet — tap Present or Absent after each class.
            </p>
          ) : onTrack ? (
            <>
              <Badge tone="success">On track</Badge>
              <p className="mt-2 text-sm text-fg">
                You can skip{" "}
                <span className="font-bold text-success-600">{skippable}</span>{" "}
                {skippable === 1 ? "class" : "classes"} and stay ≥{target}%.
              </p>
            </>
          ) : (
            <>
              <Badge tone="danger">Below target</Badge>
              <p className="mt-2 text-sm text-fg">
                Attend the next{" "}
                <span className="font-bold text-danger-600">
                  {recover === Infinity ? "∞" : recover}
                </span>{" "}
                {recover === 1 ? "class" : "classes"} to get back to {target}%.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t pt-4">
        <Button
          size="sm"
          fullWidth
          leftIcon={Check}
          loading={busy === "present"}
          disabled={!!busy}
          onClick={() => onAction("present")}
        >
          Present
        </Button>
        <Button
          size="sm"
          fullWidth
          variant="danger"
          leftIcon={X}
          loading={busy === "absent"}
          disabled={!!busy}
          onClick={() => onAction("absent")}
        >
          Absent
        </Button>
        <button
          type="button"
          onClick={() => onAction("undo")}
          disabled={!!busy || !canUndo}
          aria-label="Undo last class"
          title="Undo the last class you marked"
          className="ring-focus inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border text-muted transition hover:text-fg disabled:opacity-40"
        >
          <Undo2 size={15} />
        </button>
      </div>

      <ConfirmModal
        open={showDelete}
        title={`Delete ${name}?`}
        description="Attendance history for this subject will be removed."
        confirmText="Delete"
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
