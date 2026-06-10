import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Plus, Percent, BookOpen, AlertTriangle } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import SubjectCard from "../components/attendance/SubjectCard";
import SubjectModal from "../components/attendance/SubjectModal";
import { percentage, formatPercent } from "../components/attendance/attendanceMath";
import {
  fetchAttendance,
  addAttendanceSubject,
  updateAttendanceSubject,
  deleteAttendanceSubject,
} from "../api/attendance";
import { useToast } from "../components/ui/useToast";

function StatCard({ icon: Icon, label, value, tone = "primary" }) {
  return (
    <Card padded={false} className="p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            tone === "danger"
              ? "bg-danger-500/10 text-danger-600"
              : "bg-primary-600/10 text-primary-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="font-display text-xl font-extrabold text-fg">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function Attendance() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, subject: null });
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  // Last present/absent marked per subject in this session — powers Undo.
  const [lastActions, setLastActions] = useState({});
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setSubjects(await fetchAttendance());
      } catch (err) {
        console.error("Failed to load attendance", err);
        show("Could not load attendance", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  const replaceSubject = (updated) => {
    setSubjects((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s))
    );
  };

  const handleAdd = async (payload) => {
    const created = await addAttendanceSubject(payload);
    setSubjects((prev) => [...prev, created]);
    show("Subject added", "success");
  };

  const handleEdit = async (payload) => {
    const updated = await updateAttendanceSubject(modal.subject._id, payload);
    replaceSubject(updated);
    show("Subject updated", "success");
  };

  const handleAction = async (subject, action) => {
    let apiAction = action;
    if (action === "undo") {
      const last = lastActions[subject._id];
      if (!last) return;
      apiAction = `undo-${last}`;
    }

    setBusyId(subject._id);
    setBusyAction(action === "undo" ? "undo" : action);
    try {
      const updated = await updateAttendanceSubject(subject._id, {
        action: apiAction,
      });
      replaceSubject(updated);
      setLastActions((prev) => {
        const next = { ...prev };
        if (action === "undo") delete next[subject._id];
        else next[subject._id] = action;
        return next;
      });
    } catch (err) {
      console.error("Failed to update attendance", err);
      show(err?.response?.data?.message || "Failed to update attendance", "error");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const handleDelete = async (subject) => {
    try {
      await deleteAttendanceSubject(subject._id);
      setSubjects((prev) => prev.filter((s) => s._id !== subject._id));
      show("Subject removed", "success");
    } catch (err) {
      console.error("Failed to delete subject", err);
      show("Failed to remove subject", "error");
    }
  };

  const overall = useMemo(() => {
    const attended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const held = subjects.reduce((sum, s) => sum + s.held, 0);
    return percentage(attended, held);
  }, [subjects]);

  const atRisk = subjects.filter((s) => {
    const pct = percentage(s.attended, s.held);
    return pct != null && pct < s.target;
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academics"
        title="Attendance"
        subtitle='Mark every class and always know "can I skip the next one?"'
        icon={CalendarCheck}
        actions={
          <Button
            leftIcon={Plus}
            onClick={() => setModal({ open: true, subject: null })}
          >
            Add subject
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No subjects yet"
          description="Add the subjects you attend this semester to start tracking."
          action={
            <Button
              leftIcon={Plus}
              onClick={() => setModal({ open: true, subject: null })}
            >
              Add subject
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Percent}
              label="Overall"
              value={formatPercent(overall)}
            />
            <StatCard icon={BookOpen} label="Subjects" value={subjects.length} />
            <StatCard
              icon={AlertTriangle}
              label="Below target"
              value={atRisk}
              tone={atRisk > 0 ? "danger" : "primary"}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                busy={busyId === subject._id ? busyAction : null}
                canUndo={!!lastActions[subject._id]}
                onAction={(action) => handleAction(subject, action)}
                onEdit={() => setModal({ open: true, subject })}
                onDelete={() => handleDelete(subject)}
              />
            ))}
          </div>
        </>
      )}

      <SubjectModal
        open={modal.open}
        subject={modal.subject}
        onClose={() => setModal({ open: false, subject: null })}
        onSubmit={modal.subject ? handleEdit : handleAdd}
      />
    </div>
  );
}
