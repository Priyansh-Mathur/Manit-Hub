import { cn } from "../../lib/cn";

const tones = {
  neutral: "bg-muted/12 text-fg ring-1 ring-border",
  primary: "bg-primary-500/12 text-primary-700 ring-1 ring-primary-500/20 dark:text-primary-200",
  accent: "bg-accent-500/12 text-accent-700 ring-1 ring-accent-500/20 dark:text-accent-200",
  gold: "bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/25 dark:text-gold-200",
  success: "bg-success-500/12 text-success-700 ring-1 ring-success-500/20 dark:text-success-500",
  warning: "bg-warning-500/14 text-warning-600 ring-1 ring-warning-500/25",
  danger: "bg-danger-500/12 text-danger-700 ring-1 ring-danger-500/20 dark:text-danger-500",
  solid: "bg-primary-600 text-white",
  outline: "text-muted ring-1 ring-border",
};

export default function Badge({ tone = "neutral", icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
