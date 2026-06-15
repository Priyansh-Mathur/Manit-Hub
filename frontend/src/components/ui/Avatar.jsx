import { cn } from "../../lib/cn";
import { avatarFor } from "../../lib/images";

const sizes = {
  xs: "h-7 w-7 text-[11px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const dotSizes = {
  xs: "h-2 w-2",
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
};

export default function Avatar({
  src,
  name = "?",
  size = "md",
  ring = false,
  online,
  className,
}) {
  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";
  const url = src || avatarFor(name || "?", initial);
  const img = (
    <img
      src={url}
      alt={name}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = avatarFor(name || "?", initial);
      }}
      className={cn(
        "inline-block shrink-0 rounded-full bg-muted/15 object-cover",
        sizes[size],
        ring && "ring-2 ring-surface",
        className
      )}
    />
  );

  // `online` is tri-state: undefined = no indicator, true = green, false = grey.
  if (online === undefined) return img;

  return (
    <span className="relative inline-block shrink-0">
      {img}
      <span
        title={online ? "Online" : "Offline"}
        className={cn(
          "absolute bottom-0 right-0 rounded-full ring-2 ring-surface",
          dotSizes[size],
          online ? "bg-success-500" : "bg-muted/50"
        )}
      />
    </span>
  );
}

export function AvatarStack({ people = [], max = 4, size = "sm", className }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const dim = size === "xs" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs";
  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((p, i) => (
        <Avatar
          key={p?._id || p?.id || i}
          src={p?.avatarUrl || p?.avatar}
          name={p?.displayName || p?.name || "?"}
          size={size}
          className="-ml-2 ring-2 ring-surface first:ml-0"
        />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            "-ml-2 inline-flex items-center justify-center rounded-full bg-muted/20 font-semibold text-fg ring-2 ring-surface",
            dim
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
