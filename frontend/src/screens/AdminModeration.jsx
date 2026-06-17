import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, Trash2, XCircle, ShieldCheck } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useAuthContext } from "../context/useAuthContext";
import { fetchReports, handleReport } from "../api/reports";
import { useToast } from "../components/ui/useToast";

const TYPE_LABELS = {
  listing: "Marketplace listing",
  document: "Study Vault document",
  confession: "Confession",
  question: "Forum question",
  answer: "Forum answer",
  lostfound: "Lost & Found post",
  ride: "Ride",
  event: "Event",
};

const STATUS_TONES = {
  open: "warning",
  resolved: "success",
  dismissed: "neutral",
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function AdminModeration() {
  const { user } = useAuthContext();
  const [status, setStatus] = useState("open");
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchReports({ status });
      setReports(response.items);
      setMeta(response.meta);
    } catch (err) {
      console.error("Failed to fetch reports", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user?.isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="You don't have access to the moderation queue."
      />
    );
  }

  const act = async (report, action) => {
    setBusyId(report._id);
    try {
      const updated = await handleReport(report._id, action);
      setReports((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );
      show(action === "remove" ? "Content removed" : "Report dismissed", "success");
    } catch (err) {
      console.error("Report action failed", err);
      show(err?.response?.data?.message || "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Moderation"
        subtitle={`Review reported content across the campus. ${meta?.openCount ?? 0} open.`}
        icon={ShieldCheck}
        actions={
          <Segmented
            options={[
              { value: "open", label: "Open", count: meta?.openCount },
              { value: "resolved", label: "Resolved" },
              { value: "dismissed", label: "Dismissed" },
            ]}
            value={status}
            onChange={setStatus}
          />
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Queue is clear"
          description="No reports here — the campus is behaving."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="rounded-2xl border bg-card p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="primary">
                    {TYPE_LABELS[report.targetType] || report.targetType}
                  </Badge>
                  <Badge tone={STATUS_TONES[report.status]}>{report.status}</Badge>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {timeAgo(report.createdAt)}
                </span>
              </div>

              <div className="mt-3 rounded-xl border bg-surface px-4 py-3">
                <p className="text-sm font-semibold text-fg">
                  {report.snapshot?.title || "(no title)"}
                </p>
                {report.snapshot?.content && (
                  <p className="mt-1 text-sm text-muted line-clamp-2">
                    {report.snapshot.content}
                  </p>
                )}
              </div>

              <p className="mt-3 text-sm text-fg">
                <span className="font-semibold">Reason:</span> {report.reason}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Avatar
                    src={report.reporter?.avatarUrl}
                    name={report.reporter?.displayName || "Student"}
                    size="xs"
                  />
                  reported by{" "}
                  <span className="font-medium text-fg">
                    {report.reporter?.displayName}
                  </span>
                  {report.handledBy && (
                    <> · handled by {report.handledBy.displayName}</>
                  )}
                </div>

                {report.status === "open" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={Trash2}
                      disabled={busyId === report._id}
                      onClick={() => setConfirmRemove(report)}
                    >
                      Remove content
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={XCircle}
                      disabled={busyId === report._id}
                      onClick={() => act(report, "dismiss")}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmRemove}
        title="Remove this content?"
        description="It will be hidden from everyone and all matching reports resolved."
        confirmText="Remove"
        tone="danger"
        onCancel={() => setConfirmRemove(null)}
        onConfirm={() => {
          const report = confirmRemove;
          setConfirmRemove(null);
          act(report, "remove");
        }}
      />
    </div>
  );
}
