import { Package, Users, MessageCircle } from "lucide-react";
import Skeleton from "../ui/Skeleton";

export default function StatsOverview({ stats, loading }) {
  const statItems = [
    { label: "My listings", value: stats.listings, icon: Package, tone: "text-primary-600 bg-primary-600/10" },
    { label: "Study groups", value: stats.studyGroups, icon: Users, tone: "text-gold-600 bg-gold-500/12" },
    { label: "Conversations", value: stats.messages, icon: MessageCircle, tone: "text-accent-600 bg-accent-500/12" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card"
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.tone}`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted">{stat.label}</p>
              {loading ? (
                <Skeleton className="mt-1.5 h-7 w-12" />
              ) : (
                <p className="font-display text-2xl font-extrabold tabular-nums text-fg">
                  {stat.value}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
