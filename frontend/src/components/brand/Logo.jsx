import { cn } from "../../lib/cn";

/**
 * MANIT-inspired crest: a navy roundel ringed in heritage gold, an open book,
 * and a gold spark. Schematic (not the official emblem) but unmistakably
 * institutional.
 */
export function Crest({ className = "h-9 w-9" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Manit Hub crest"
    >
      <defs>
        <linearGradient id="crestNavy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a66ae" />
          <stop offset="1" stopColor="#142b4c" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#crestNavy)" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="#bd8a1e" strokeWidth="1.5" />
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="#e0ba4f"
        strokeWidth="0.6"
        opacity="0.55"
      />
      <polygon points="12,18.5 23,16.5 23,31.6 12,33.1" fill="#ffffff" />
      <polygon points="36,18.5 25,16.5 25,31.6 36,33.1" fill="#ffffff" />
      <g stroke="#1e4f92" strokeWidth="0.8" opacity="0.5" strokeLinecap="round">
        <line x1="14.6" y1="21" x2="21" y2="19.9" />
        <line x1="14.6" y1="24" x2="21" y2="22.9" />
        <line x1="14.6" y1="27" x2="21" y2="25.9" />
        <line x1="27" y1="19.9" x2="33.4" y2="21" />
        <line x1="27" y1="22.9" x2="33.4" y2="24" />
        <line x1="27" y1="25.9" x2="33.4" y2="27" />
      </g>
      <rect x="23" y="16.2" width="2" height="15.6" fill="#142b4c" />
      <path
        d="M24 7.4l1.15 2.55 2.55 1.15-2.55 1.15L24 14.8l-1.15-2.55-2.55-1.15 2.55-1.15z"
        fill="#e0ba4f"
      />
    </svg>
  );
}

export default function Logo({
  withText = true,
  subtitle = "NIT Bhopal",
  className = "",
  crestClassName = "h-9 w-9",
  titleClassName = "",
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Crest className={crestClassName} />
      {withText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.05rem] font-extrabold tracking-tight text-fg",
              titleClassName
            )}
          >
            Manit Hub
          </span>
          {subtitle && (
            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
