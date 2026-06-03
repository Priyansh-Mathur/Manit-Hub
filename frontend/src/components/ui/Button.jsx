import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const base =
  "ring-focus inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all active:translate-y-px disabled:pointer-events-none disabled:opacity-55";

const variants = {
  primary: "bg-primary-600 text-white shadow-sm hover:bg-primary-700",
  accent: "bg-accent-600 text-white shadow-sm hover:bg-accent-700",
  gold: "bg-gold-500 text-primary-950 shadow-sm hover:bg-gold-600",
  secondary: "border bg-surface text-fg shadow-sm hover:bg-muted/10",
  outline:
    "border-2 border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white dark:text-primary-200 dark:hover:text-white",
  ghost: "text-muted hover:bg-muted/10 hover:text-fg",
  danger: "bg-danger-600 text-white shadow-sm hover:bg-danger-700",
  subtle:
    "bg-primary-500/10 text-primary-700 hover:bg-primary-500/20 dark:text-primary-200",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    className,
    children,
    loading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    fullWidth = false,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon className="h-4 w-4" />
      ) : null}
      {children}
      {!loading && RightIcon ? <RightIcon className="h-4 w-4" /> : null}
    </button>
  );
});

export default Button;
