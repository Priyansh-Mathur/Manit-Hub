import { cn } from "../../lib/cn";

export default function Segmented({ options, value, onChange, className }) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-2xl border bg-surface p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "ring-focus inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition",
              active
                ? "bg-primary-600 text-white shadow-sm"
                : "text-muted hover:text-fg"
            )}
          >
            {opt.icon ? <opt.icon className="h-4 w-4" /> : null}
            {opt.label}
            {opt.count != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] font-semibold",
                  active ? "bg-white/20" : "bg-muted/15"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
