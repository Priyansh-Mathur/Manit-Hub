import { Link } from "react-router-dom";
import { Menu, Search, Bell } from "lucide-react";
import Logo from "../brand/Logo";
import Avatar from "../ui/Avatar";
import ThemeToggle from "../ui/ThemeToggle";
import { useCommand } from "../command/useCommand";
import useUnreadCount from "../../hooks/useUnreadCount";
import { useAuthContext } from "../../context/useAuthContext";

export default function TopBar({ onMenu }) {
  const { openCommand } = useCommand();
  const unread = useUnreadCount();
  const { user } = useAuthContext();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-bg/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="ring-focus -ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-muted/10 hover:text-fg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link to="/dashboard" className="lg:hidden">
        <Logo withText={false} crestClassName="h-8 w-8" />
      </Link>

      <button
        type="button"
        onClick={openCommand}
        className="ring-focus ml-1 hidden h-10 items-center gap-2 rounded-xl border bg-surface px-3 text-sm text-muted transition hover:text-fg sm:flex sm:w-72 lg:w-80"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search Manit Hub…</span>
        <kbd className="rounded-md border bg-bg px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <div className="flex flex-1 items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={openCommand}
          aria-label="Search"
          className="ring-focus inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-muted/10 hover:text-fg sm:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        <ThemeToggle />

        <Link
          to="/notifications"
          aria-label="Notifications"
          className="ring-focus relative inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-surface text-muted transition hover:text-fg"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white ring-2 ring-bg">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        <Link to="/settings" aria-label="Profile" className="ring-focus rounded-full">
          <Avatar
            src={user?.avatarUrl || user?.avatar}
            name={user?.displayName || "Student"}
            size="sm"
            ring
          />
        </Link>
      </div>
    </header>
  );
}
