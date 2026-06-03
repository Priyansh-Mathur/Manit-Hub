import { useNavigate } from "react-router-dom";
import { ShoppingBag, Users, Map, ArrowUpRight } from "lucide-react";

export default function QuickAccess({ summary, loading }) {
  const navigate = useNavigate();

  const items = [
    {
      title: "Marketplace",
      desc: "Buy, sell & trade items with students.",
      stat: `${loading ? "—" : summary.activeListings} active listings`,
      icon: ShoppingBag,
      to: "/marketplace",
    },
    {
      title: "Study Groups",
      desc: "Find or create branch-wise study groups.",
      stat: `${loading ? "—" : summary.activeGroups} active groups`,
      icon: Users,
      to: "/study-groups",
    },
    {
      title: "Campus Map",
      desc: "Navigate buildings, hostels & canteens.",
      stat: `${loading ? "—" : summary.locations} locations`,
      icon: Map,
      to: "/campus-maps",
    },
  ];

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold text-fg">
        Quick access
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.to)}
              className="ring-focus group flex flex-col rounded-2xl border bg-card p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted transition group-hover:text-primary-600" />
              </div>
              <h3 className="mt-4 font-display font-bold text-fg">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.desc}</p>
              <p className="mt-4 text-sm font-semibold text-primary-600">
                {item.stat}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
