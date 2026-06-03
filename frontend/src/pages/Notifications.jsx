import { useState, useEffect, useCallback } from "react";
import { Bell, MessageCircle, Users, ShoppingBag, Check, X, CheckCheck } from "lucide-react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../api/notifications";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Segmented from "../components/ui/Segmented";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { cn } from "../lib/cn";

const typeMeta = {
  message: { icon: MessageCircle, tone: "bg-info-500/12 text-info-600" },
  "study-group": { icon: Users, tone: "bg-success-500/12 text-success-600" },
  marketplace: { icon: ShoppingBag, tone: "bg-gold-500/14 text-gold-600" },
  default: { icon: Bell, tone: "bg-primary-600/10 text-primary-600" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === "messages") params.type = "message";
      if (filter === "groups") params.type = "study-group";
      if (filter === "marketplace") params.type = "marketplace";
      if (filter === "unread") params.read = "false";
      const response = await fetchNotifications({ ...params, page, limit: 8 });

      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.meta.unreadCount);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => setPage(1), [filter]);
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "messages", label: "Messages" },
    { value: "groups", label: "Groups" },
    { value: "marketplace", label: "Marketplace" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        icon={Bell}
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
            : "You're all caught up."
        }
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" size="sm" leftIcon={CheckCheck} onClick={markAllAsRead}>
              Mark all read
            </Button>
          )
        }
      />

      <div className="overflow-x-auto">
        <Segmented options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-card">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="When something happens on campus, you'll see it here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const m = typeMeta[notification.type] || typeMeta.default;
            const Icon = m.icon;
            return (
              <div
                key={notification._id}
                className={cn(
                  "group flex items-start gap-4 rounded-2xl border bg-card p-4 shadow-card transition",
                  !notification.read && "ring-1 ring-primary-500/25"
                )}
              >
                <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", m.tone)}>
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent-600" />
                    )}
                    <h3 className="truncate font-semibold text-fg">
                      {notification.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-muted">{notification.description}</p>
                  <p className="mt-2 text-xs text-muted/80">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification._id)}
                      title="Mark as read"
                      className="ring-focus rounded-lg p-2 text-muted transition hover:bg-success-500/10 hover:text-success-600"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(notification._id)}
                    title="Delete"
                    className="ring-focus rounded-lg p-2 text-muted transition hover:bg-danger-500/10 hover:text-danger-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
            disabled={page >= meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
