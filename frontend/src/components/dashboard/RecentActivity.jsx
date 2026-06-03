import { Users, MessageCircle, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";

export default function RecentActivity({ studyGroups, conversations, loading }) {
  const navigate = useNavigate();

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const activities = [];

  studyGroups.slice(0, 2).forEach((group) => {
    activities.push({
      id: `group-${group._id}`,
      icon: Users,
      tone: "bg-gold-500/12 text-gold-600",
      title: `Joined study group: ${group.name}`,
      time: formatTime(group.createdAt),
    });
  });

  conversations.slice(0, 2).forEach((conv) => {
    activities.push({
      id: `conv-${conv._id}`,
      icon: MessageCircle,
      tone: "bg-accent-500/12 text-accent-600",
      title: `New conversation about: ${conv.listingTitle}`,
      time: formatTime(conv.lastMessageAt || conv.createdAt),
    });
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-fg">Recent activity</h2>
        <button
          className="ring-focus rounded-lg px-2 py-1 text-sm font-medium text-primary-600 transition hover:text-primary-700"
          onClick={() => navigate("/notifications")}
        >
          View all →
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        {loading ? (
          <div className="divide-y">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Join a study group or start a conversation to see it here."
            className="border-0 bg-transparent py-12"
          />
        ) : (
          <div className="divide-y">
            {activities.slice(0, 4).map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-3 p-4">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${activity.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
