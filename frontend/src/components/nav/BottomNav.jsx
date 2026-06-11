import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../lib/cn";
import { bottomNavItems } from "./navConfig";

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t bg-surface/95 backdrop-blur lg:hidden">
      {bottomNavItems.map((item) => {
        // Hub entries match any of their grouped routes.
        const matchActive = item.match
          ? item.match.some((p) => pathname === p || pathname.startsWith(`${p}/`))
          : undefined;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "ring-focus flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                (matchActive ?? isActive) ? "text-primary-600" : "text-muted"
              )
            }
          >
            {({ isActive: navActive }) => {
              const isActive = matchActive ?? navActive;
              return (
                <>
                  <item.icon
                    className={cn("h-5 w-5 transition-transform", isActive && "scale-110")}
                  />
                  <span>{item.short}</span>
                </>
              );
            }}
          </NavLink>
        );
      })}
    </nav>
  );
}
