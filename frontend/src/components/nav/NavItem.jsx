import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";

export default function NavItem({ to, icon: Icon, label, badge = 0, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
          isActive
            ? "bg-primary-600/10 text-primary-700 dark:text-primary-100"
            : "text-muted hover:bg-muted/8 hover:text-fg"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-primary-600 transition-all",
              isActive ? "w-1" : "w-0"
            )}
          />
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition",
              isActive
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-muted/10 text-muted group-hover:text-fg"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="flex-1 truncate">{label}</span>
          {badge > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent-600 px-1.5 text-[11px] font-bold text-white">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
