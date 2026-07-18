import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, Ban, RotateCcw, ShieldAlert, ShieldCheck } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Segmented from "../components/ui/Segmented";
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
  fetchAdminUsers,
  suspendUser,
  unsuspendUser,
} from "../api/admin";

export default function AdminUsers() {
  const { user } = useAuthContext();
  const { show } = useToast();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers({ status, search: debounced });
      setUsers(res.items);
      setMeta(res.meta);
    } catch (err) {
      console.error("Failed to load users", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [status, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user?.isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="You don't have access to account management."
      />
    );
  }

  const doSuspend = async (reason) => {
    if (!suspendTarget) return;
    setBusy(true);
    try {
      await suspendUser(suspendTarget._id, reason);
      show("Account suspended", "success");
      setSuspendTarget(null);
      load();
    } catch (err) {
      show(err?.response?.data?.message || "Suspend failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const doUnsuspend = async () => {
    if (!unsuspendTarget) return;
    setBusy(true);
    try {
      await unsuspendUser(unsuspendTarget._id);
      show("Account reinstated", "success");
      setUnsuspendTarget(null);
      load();
    } catch (err) {
      show(err?.response?.data?.message || "Action failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Admin · CEO"
        title="Accounts"
        subtitle={`${meta?.total ?? 0} accounts · ${meta?.suspendedCount ?? 0} suspended`}
        icon={Users}
        actions={
          <Segmented
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended", count: meta?.suspendedCount },
            ]}
            value={status}
            onChange={setStatus}
          />
        }
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, @handle or email…"
          className="field w-full pl-11"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No accounts found"
          description="Try a different filter or search term."
        />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card"
            >
              <Link
                to={`/admin/users/${u._id}`}
                className="ring-focus flex min-w-0 flex-1 items-center gap-3 rounded-lg"
              >
                <Avatar src={u.avatarUrl} name={u.displayName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-fg">
                      {u.displayName}
                    </p>
                    {u.isAdmin && <Badge tone="primary">admin</Badge>}
                    {u.isBanned && <Badge tone="danger">suspended</Badge>}
                    {!u.emailVerified && <Badge tone="warning">unverified</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted">
                    {u.handle ? `@${u.handle} · ` : ""}
                    {u.email}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs text-muted">{u.points ?? 0} pts</p>
                  {u.strikes > 0 && (
                    <p className="text-xs font-medium text-danger-600">
                      {u.strikes} strike{u.strikes > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </Link>

              {!u.isAdmin && (
                <div className="shrink-0">
                  {u.isBanned ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={RotateCcw}
                      onClick={() => setUnsuspendTarget(u)}
                    >
                      Unsuspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={Ban}
                      onClick={() => setSuspendTarget(u)}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <SuspendModal
        open={!!suspendTarget}
        userName={suspendTarget?.displayName}
        loading={busy}
        onCancel={() => setSuspendTarget(null)}
        onConfirm={doSuspend}
      />

      <ConfirmModal
        open={!!unsuspendTarget}
        title="Reinstate this account?"
        description="The suspension is lifted and strikes reset to zero. Use this to reverse a ban caused by fake reports."
        confirmText="Reinstate"
        tone="primary"
        loading={busy}
        onCancel={() => setUnsuspendTarget(null)}
        onConfirm={doUnsuspend}
      />
    </div>
  );
}
