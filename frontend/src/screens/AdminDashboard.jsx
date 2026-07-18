import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageCircle,
  FileText,
  ShieldAlert,
  UserCheck,
  Ban,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Avatar from "../components/ui/Avatar";
import { useAuthContext } from "../context/useAuthContext";
import { fetchOverview, fetchGrowth, fetchBreakdown } from "../api/admin";
import { StatTile, LineChart, BarList } from "../components/admin/charts";

const GROWTH_METRICS = [
  { value: "users", label: "Users" },
  { value: "listings", label: "Listings" },
  { value: "messages", label: "Messages" },
  { value: "offers", label: "Offers" },
];

const RANGES = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

const mapToItems = (obj = {}) =>
  Object.entries(obj)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

const fmt = (n) => (n ?? 0).toLocaleString("en-IN");

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const [overview, setOverview] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  const [metric, setMetric] = useState("users");
  const [range, setRange] = useState(30);
  const [growth, setGrowth] = useState(null);
  const [growthLoading, setGrowthLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [ov, bd] = await Promise.all([fetchOverview(), fetchBreakdown()]);
        if (!alive) return;
        setOverview(ov);
        setBreakdown(bd);
      } catch (err) {
        console.error("Failed to load admin overview", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const loadGrowth = useCallback(async () => {
    setGrowthLoading(true);
    try {
      setGrowth(await fetchGrowth(metric, range));
    } catch (err) {
      console.error("Failed to load growth", err);
      setGrowth(null);
    } finally {
      setGrowthLoading(false);
    }
  }, [metric, range]);

  useEffect(() => {
    loadGrowth();
  }, [loadGrowth]);

  if (!user?.isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="You don't have access to the admin console."
      />
    );
  }

  const u = overview?.users;
  const m = overview?.marketplace;
  const e = overview?.engagement;
  const c = overview?.content;
  const mod = overview?.moderation;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Admin · CEO"
        title="Overview"
        subtitle="Platform-wide growth, engagement and moderation at a glance."
        icon={LayoutDashboard}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/users"
              className="ring-focus inline-flex items-center gap-1.5 rounded-xl border bg-surface px-3.5 py-2 text-sm font-medium text-fg transition hover:bg-muted/10"
            >
              <Users className="h-4 w-4" /> Accounts
            </Link>
            <Link
              to="/admin/moderation"
              className="ring-focus inline-flex items-center gap-1.5 rounded-xl border bg-surface px-3.5 py-2 text-sm font-medium text-fg transition hover:bg-muted/10"
            >
              <ShieldAlert className="h-4 w-4" /> Moderation
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : !overview ? (
        <EmptyState
          icon={ShieldAlert}
          title="Couldn't load stats"
          description="Something went wrong fetching the platform metrics."
        />
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatTile
              label="Total users"
              value={fmt(u.total)}
              sub={`+${fmt(u.new7d)} this week`}
              icon={Users}
            />
            <StatTile
              label="Active (7d)"
              value={fmt(u.active7d)}
              sub="sent a message"
              icon={UserCheck}
              tone="success"
            />
            <StatTile
              label="New today"
              value={fmt(u.new24h)}
              sub={`${fmt(u.new30d)} in 30d`}
              icon={TrendingUp}
              tone="accent"
            />
            <StatTile
              label="Suspended"
              value={fmt(u.suspended)}
              sub={`${fmt(u.verified)} verified`}
              icon={Ban}
              tone="danger"
            />
            <StatTile
              label="Active listings"
              value={fmt(m.activeListings)}
              sub={`${fmt(m.soldListings)} sold`}
              icon={ShoppingBag}
            />
            <StatTile
              label="Offers"
              value={fmt(m.totalOffers)}
              sub={`${m.offerAcceptanceRate}% accepted`}
              icon={ShoppingBag}
              tone="accent"
            />
            <StatTile
              label="Messages"
              value={fmt(e.messages)}
              sub={`+${fmt(e.messages7d)} this week`}
              icon={MessageCircle}
            />
            <StatTile
              label="Open reports"
              value={fmt(mod.openReports)}
              sub={
                mod.avgHandleHours != null
                  ? `~${mod.avgHandleHours}h to handle`
                  : "none handled yet"
              }
              icon={ShieldAlert}
              tone={mod.openReports > 0 ? "warning" : "success"}
            />
          </div>

          {/* Growth chart */}
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-fg">Growth</h2>
                <p className="text-sm text-muted">
                  {fmt(growth?.total)} new {metric} in the last {range} days
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Segmented options={GROWTH_METRICS} value={metric} onChange={setMetric} />
                <Segmented options={RANGES} value={range} onChange={setRange} />
              </div>
            </div>
            {growthLoading ? (
              <Skeleton className="h-[120px] rounded-xl" />
            ) : (
              <LineChart series={growth?.series || []} />
            )}
          </div>

          {/* Content stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile label="Documents" value={fmt(c.documents)} sub={`${fmt(c.downloads)} downloads`} icon={FileText} />
            <StatTile label="Questions" value={fmt(c.questions)} sub={`${fmt(c.answers)} answers`} />
            <StatTile label="Confessions" value={fmt(c.confessions)} />
            <StatTile label="Events" value={fmt(c.events)} />
            <StatTile label="Rides" value={fmt(c.rides)} />
          </div>

          {/* Breakdowns */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5 shadow-card">
              <h3 className="mb-3 font-display text-base font-bold text-fg">
                Listings by category
              </h3>
              <BarList items={mapToItems(breakdown?.listingsByCategory)} />
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-card">
              <h3 className="mb-3 font-display text-base font-bold text-fg">
                Reports by type
              </h3>
              <BarList
                items={mapToItems(breakdown?.reportsByType)}
                empty="No reports filed"
              />
            </div>
          </div>

          {/* Top content + sellers */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5 shadow-card">
              <h3 className="mb-3 font-display text-base font-bold text-fg">
                Top documents
              </h3>
              {breakdown?.topDocuments?.length ? (
                <ul className="space-y-3">
                  {breakdown.topDocuments.map((doc) => (
                    <li key={doc._id} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg">{doc.title}</p>
                        <p className="text-xs text-muted">
                          {doc.uploader?.displayName || "Unknown"} · {doc.type}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted">
                        ▲ {doc.upvoteCount} · ↓ {doc.downloadCount}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-muted">No documents yet</p>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-card">
              <h3 className="mb-3 font-display text-base font-bold text-fg">
                Most active sellers
              </h3>
              {breakdown?.topSellers?.length ? (
                <ul className="space-y-3">
                  {breakdown.topSellers.map((row) => (
                    <li key={row.seller._id}>
                      <Link
                        to={`/admin/users/${row.seller._id}`}
                        className="ring-focus flex items-center gap-3 rounded-lg p-1 transition hover:bg-muted/10"
                      >
                        <Avatar
                          src={row.seller.avatarUrl}
                          name={row.seller.displayName}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-fg">
                            {row.seller.displayName}
                          </p>
                          {row.seller.handle && (
                            <p className="truncate text-xs text-muted">@{row.seller.handle}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-muted">
                          {row.listings} listings
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-muted">No sellers yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
