import { useId } from "react";
import { cn } from "../../lib/cn";

export default function Input({
  label,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  error,
  hint,
  className,
  id,
  ...props
}) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-fg"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        )}

        <input
          id={inputId}
          className={cn(
            "field",
            Icon && "pl-11",
            RightIcon && "pr-11",
            error &&
              "border-danger-500 focus:border-danger-500 focus:ring-danger-500/15",
            className
          )}
          {...props}
        />

        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            tabIndex={-1}
            className="ring-focus absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:text-fg"
          >
            <RightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
