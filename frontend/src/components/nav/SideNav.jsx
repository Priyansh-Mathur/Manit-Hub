import { Link } from "react-router-dom";
import { Search, Settings, LogOut } from "lucide-react";
import Logo from "../brand/Logo";
import Avatar from "../ui/Avatar";
import ThemeToggle from "../ui/ThemeToggle";
import NavItem from "./NavItem";
import { navItems } from "./navConfig";
import { useCommand } from "../command/useCommand";
import useUnreadCount from "../../hooks/useUnreadCount";
import { useAuthContext } from "../../context/useAuthContext";

export default function SideNav() {
  const unread = useUnreadCount();
  const { openCommand } = useCommand();
  const { user, logout } = useAuthContext();

  return (
    <aside className="sticky top-0 flex h-screen w-[264px] flex-col gap-4 border-r bg-surface px-4 py-5">
      <Link to="/dashboard" className="ring-focus rounded-xl px-1 py-1">
        <Logo />
      </Link>

      <button
        type="button"
        onClick={openCommand}
        className="ring-focus flex items-center gap-2 rounded-xl border bg-bg px-3 py-2.5 text-sm text-muted transition hover:text-fg"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded-md border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">
          ⌘K
        </kbd>
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted/70">
          Menu
        </p>
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.name}
            badge={item.name === "Notifications" ? unread : 0}
          />
        ))}
      </nav>

      <div className="space-y-2 border-t pt-3">
        <Link
          to="/settings"
          className="ring-focus flex items-center gap-3 rounded-xl p-2 transition hover:bg-muted/8"
        >
          <Avatar
            src={user?.avatarUrl || user?.avatar}
            name={user?.displayName || "Student"}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg">
              {user?.displayName || "Student"}
            </p>
            <p className="truncate text-xs text-muted">
              {user?.email || "NIT Bhopal"}
            </p>
          </div>
          <Settings className="h-4 w-4 text-muted" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="ring-focus inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border bg-surface text-sm font-medium text-muted transition hover:text-accent-600"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
