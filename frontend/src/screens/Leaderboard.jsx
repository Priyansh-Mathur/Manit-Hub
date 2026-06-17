import { useEffect, useState } from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { cn } from "../lib/cn";
import { useAuthContext } from "../context/useAuthContext";
import { fetchLeaderboard } from "../api/leaderboard";
import HubTabs from "../components/nav/HubTabs";

const levelFor = (points) => {
  if (points >= 1000) return "MANIT Legend";
  if (points >= 500) return "Campus Hero";
  if (points >= 100) return "Rising Star";
  if (points > 0) return "Contributor";
  return "Fresher";
};

const PODIUM_STYLES = [
  "from-gold-400/30 to-gold-500/10 ring-gold-500/40",
  "from-muted/25 to-muted/5 ring-muted/40",
  "from-accent-500/20 to-accent-500/5 ring-accent-500/30",
];

export default function Leaderboard() {
  const { user } = useAuthContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setData(await fetchLeaderboard());
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const top3 = data?.leaderboard?.slice(0, 3) || [];
  const rest = data?.leaderboard?.slice(3) || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <HubTabs hub="campus" />
      <PageHeader
        eyebrow="Community"
        title="Leaderboard"
        subtitle="Karma for contributing — notes, answers, listings, rides & events."
        icon={Trophy}
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : !data ? (
        <EmptyState
          icon={Trophy}
          title="Leaderboard unavailable"
          description="Try again in a bit."
        />
      ) : (
        <>
          {data.me && (
            <Card padded={false} className="flex items-center gap-4 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600/10 font-display text-base font-extrabold text-primary-600">
                #{data.me.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">Your rank</p>
                <p className="text-xs text-muted">
                  {data.me.points || 0} pts · {levelFor(data.me.points)}
                </p>
              </div>
              {(data.me.badges || []).slice(0, 3).map((badge) => (
                <Badge key={badge} tone="gold">
                  {badge}
                </Badge>
              ))}
            </Card>
          )}

          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {top3.map((entry, index) => (
                <div
                  key={entry._id}
                  className={cn(
                    "flex flex-col items-center rounded-2xl bg-gradient-to-b p-4 text-center ring-1",
                    PODIUM_STYLES[index]
                  )}
                >
                  {index === 0 ? (
                    <Crown className="mb-1 h-5 w-5 text-gold-500" />
                  ) : (
                    <Medal className="mb-1 h-5 w-5 text-muted" />
                  )}
                  <Avatar
                    src={entry.avatarUrl}
                    name={entry.displayName}
                    size="md"
                  />
                  <p className="mt-2 w-full truncate text-sm font-bold text-fg">
                    {entry.displayName}
                  </p>
                  <p className="text-xs font-semibold text-primary-600">
                    {entry.points} pts
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {levelFor(entry.points)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <Card padded={false} className="divide-y">
              {rest.map((entry, index) => {
                const isMe = user && entry._id === user._id;
                return (
                  <div
                    key={entry._id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      isMe && "bg-primary-600/5"
                    )}
                  >
                    <span className="w-8 text-center font-mono text-sm font-bold text-muted">
                      {index + 4}
                    </span>
                    <Avatar
                      src={entry.avatarUrl}
                      name={entry.displayName}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-fg">
                        {entry.displayName}
                        {isMe && (
                          <span className="ml-1.5 text-xs text-primary-600">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted">
                        {levelFor(entry.points)}
                      </p>
                    </div>
                    {(entry.badges || []).slice(0, 2).map((badge) => (
                      <Badge key={badge} tone="neutral">
                        {badge}
                      </Badge>
                    ))}
                    <span className="shrink-0 font-display text-sm font-extrabold text-primary-600">
                      {entry.points}
                    </span>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
