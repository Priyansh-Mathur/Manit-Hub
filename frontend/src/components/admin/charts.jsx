import { cn } from "../../lib/cn";

/**
 * Small, dependency-free dashboard visuals (no chart library in the project).
 * All are responsive: SVGs use viewBox + width:100%, bars use flex widths.
 */

export function StatTile({ label, value, sub, icon: Icon, tone = "primary" }) {
  const toneRing = {
    primary: "text-primary-600 bg-primary-600/10",
    success: "text-success-600 bg-success-500/10",
    warning: "text-warning-600 bg-warning-500/10",
    danger: "text-danger-600 bg-danger-500/10",
    accent: "text-accent-600 bg-accent-500/10",
  }[tone];

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        {Icon && (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", toneRing)}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold text-fg">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

/**
 * Minimal area/line chart from a [{ date, count }] series.
 */
export function LineChart({ series = [], height = 120 }) {
  const width = 600; // viewBox units; scales to container width
  const pad = 6;
  const data = series.length ? series : [{ date: "", count: 0 }];
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0;
  const y = (v) => height - pad - (v / max) * (height - pad * 2);
  const x = (i) => pad + i * stepX;

  const line = data.map((d, i) => `${x(i)},${y(d.count)}`).join(" ");
  const area = `${pad},${height - pad} ${line} ${x(data.length - 1)},${height - pad}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Trend chart"
    >
      <defs>
        <linearGradient id="adminAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#adminAreaFill)" className="text-primary-500" />
      <polyline
        points={line}
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="text-primary-600"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Horizontal bar list for distributions. items: [{ label, value }].
 */
export function BarList({ items = [], empty = "No data" }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) {
    return <p className="py-4 text-center text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate capitalize text-fg">{it.label}</span>
            <span className="ml-2 shrink-0 font-semibold text-muted">{it.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/15">
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
