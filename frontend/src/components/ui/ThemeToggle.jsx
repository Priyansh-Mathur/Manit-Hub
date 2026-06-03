import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { cn } from "../../lib/cn";

export default function ThemeToggle({ className }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "ring-focus inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-surface text-muted transition hover:text-fg",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
