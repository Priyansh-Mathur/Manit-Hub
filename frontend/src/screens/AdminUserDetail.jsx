import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  RotateCcw,
  ShieldAlert,
  Flag,
  FileText,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import ConfirmModal from "../components/ui/ConfirmModal";
import SuspendModal from "../components/admin/SuspendModal";
import { useAuthContext } from "../context/useAuthContext";
import { useToast } from "../components/ui/useToast";
import {
  fetchAdminUserDetail,
  suspendUser,
  unsuspendUser,
} from "../api/admin";

const TYPE_LABELS = {
  listing: "Marketplace listings",
  document: "Study Vault documents",
  confession: "Confessions",
  question: "Forum questions",
  answer: "Forum answers",
  lostfound: "Lost & Found posts",
  ride: "Rides",
  event: "Events",
};

const STATUS_TONES = { open: "warning", resolved: "success", dismissed: "neutral" };

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuthContext();
  const { show } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showUnsuspend, setShowUnsuspend] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchAdminUserDetail(id));
    } catch (err) {
      console.error("Failed to load user", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!me?.isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="You don't have access to account management."
      />
    );
  }

  const doSuspend = async (reason) => {
    setBusy(true);
    try {
      await suspendUser(id, reason);
      show("Account suspended", "success");
      setShowSuspend(false);
      load();
    } catch (err) {
      show(err?.response?.data?.message || "Suspend failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const doUnsuspend = async () => {
    setBusy(true);
    try {
      await unsuspendUser(id);
      show("Account reinstated", "success");
      setShowUnsuspend(false);
      load();
    } catch (err) {
      show(err?.response?.data?.message || "Action failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const backBtn = (
    <button
      onClick={() => navigate(-1)}
      className="ring-focus mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted transition hover:text-fg"
    >
      <ArrowLeft className="h-4 w-4" /> Back
    </button>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        {backBtn}
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="mx-auto max-w-3xl">
        {backBtn}
        <EmptyState icon={ShieldAlert} title="User not found" />
      </div>
    );
  }

  const { user: u, content, reports, totalContent } = data;
  const contentTypes = Object.keys(content).filter((t) => content[t].count > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backBtn}

      {/* Profile header */}
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar src={u.avatarUrl} name={u.displayName} size="xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-extrabold text-fg">
                  {u.displayName}
                </h1>
                {u.isAdmin && <Badge tone="primary">admin</Badge>}
                {u.isBanned ? (
                  <Badge tone="danger">suspended</Badge>
                ) : (
                  <Badge tone="success">active</Badge>
                )}
                {!u.emailVerified && <Badge tone="warning">unverified</Badge>}
              </div>
              {u.handle && <p className="text-sm text-muted">@{u.handle}</p>}
              {u.bio && <p className="mt-2 text-sm text-fg">{u.bio}</p>}

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {u.email}
                </span>
                {u.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {u.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Joined {fmtDate(u.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {!u.isAdmin && (
            <div className="shrink-0">
              {u.isBanned ? (
                <Button variant="secondary" leftIcon={RotateCcw} onClick={() => setShowUnsuspend(true)}>
                  Unsuspend
                </Button>
              ) : (
                <Button variant="danger" leftIcon={Ban} onClick={() => setShowSuspend(true)}>
                  Suspend
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted">Points</p>
            <p className="font-display text-lg font-bold text-fg">{u.points ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Strikes</p>
            <p className={`font-display text-lg font-bold ${u.strikes > 0 ? "text-danger-600" : "text-fg"}`}>
              {u.strikes ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Content</p>
            <p className="font-display text-lg font-bold text-fg">{totalContent}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Reports</p>
            <p className={`font-display text-lg font-bold ${reports.length > 0 ? "text-warning-600" : "text-fg"}`}>
              {reports.length}
            </p>
          </div>
        </div>
      </div>

      {/* Suspension reason */}
      {u.isBanned && (
        <div className="rounded-2xl border border-danger-500/30 bg-danger-500/10 p-4">
          <div className="flex items-start gap-2.5 text-sm text-danger-600">
            <Ban className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">
                Suspended {u.bannedAt ? `on ${fmtDate(u.bannedAt)}` : ""}
              </p>
              <p className="mt-0.5">{u.banReason || "No reason recorded"}</p>
              <p className="mt-1.5 text-xs text-danger-600/80">
                If this was caused by fake reports, reinstating also resets strikes to zero.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reports against this user's content */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-fg">
          <Flag className="h-5 w-5 text-warning-600" /> Reports against them
          <span className="text-sm font-normal text-muted">({reports.length})</span>
        </h2>
        {reports.length === 0 ? (
          <p className="rounded-2xl border bg-card p-4 text-sm text-muted">
            No reports filed against this user's content.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r._id} className="rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="primary">{r.targetType}</Badge>
                    <Badge tone={STATUS_TONES[r.status]}>{r.status}</Badge>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{fmtDate(r.createdAt)}</span>
                </div>
                {r.snapshot?.title && (
                  <p className="mt-2 text-sm font-medium text-fg">{r.snapshot.title}</p>
                )}
                <p className="mt-1.5 text-sm text-fg">
                  <span className="font-semibold">Reason:</span> {r.reason}
                </p>
                <p className="mt-1 text-xs text-muted">
                  reported by {r.reporter?.displayName || "someone"}
                  {r.handledBy && <> · handled by {r.handledBy.displayName}</>}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Their content / files */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-fg">
          <FileText className="h-5 w-5 text-primary-600" /> Their content
          <span className="text-sm font-normal text-muted">({totalContent})</span>
        </h2>
        {contentTypes.length === 0 ? (
          <p className="rounded-2xl border bg-card p-4 text-sm text-muted">
            This user hasn't posted any content.
          </p>
        ) : (
          <div className="space-y-4">
            {contentTypes.map((type) => (
              <div key={type} className="rounded-2xl border bg-card p-4 shadow-card">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-fg">{TYPE_LABELS[type] || type}</h3>
                  <Badge tone="neutral">{content[type].count}</Badge>
                </div>
                <ul className="space-y-2">
                  {content[type].recent.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border bg-surface px-3 py-2 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-fg">
                            {item.title || "(untitled)"}
                          </p>
                          {item.content && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                              {item.content}
                            </p>
                          )}
                        </div>
                        {item.hidden && (
                          <Badge tone="danger" className="shrink-0">
                            hidden
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {content[type].count > content[type].recent.length && (
                  <p className="mt-2 text-xs text-muted">
                    + {content[type].count - content[type].recent.length} more
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <SuspendModal
        open={showSuspend}
        userName={u.displayName}
        loading={busy}
        onCancel={() => setShowSuspend(false)}
        onConfirm={doSuspend}
      />

      <ConfirmModal
        open={showUnsuspend}
        title="Reinstate this account?"
        description="The suspension is lifted and strikes reset to zero. Use this to reverse a ban caused by fake reports."
        confirmText="Reinstate"
        tone="primary"
        loading={busy}
        onCancel={() => setShowUnsuspend(false)}
        onConfirm={doUnsuspend}
      />
    </div>
  );
}
