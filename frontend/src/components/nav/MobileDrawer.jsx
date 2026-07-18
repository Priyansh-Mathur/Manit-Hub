import { createPortal } from "react-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Settings, LogOut } from "lucide-react";
import Logo from "../brand/Logo";
import Avatar from "../ui/Avatar";
import ThemeToggle from "../ui/ThemeToggle";
import NavItem from "./NavItem";
import { navItems, adminNavItems } from "./navConfig";
import useUnreadCount from "../../hooks/useUnreadCount";
import { useAuthContext } from "../../context/useAuthContext";

export default function MobileDrawer({ open, onClose }) {
  const unread = useUnreadCount();
  const { user, logout } = useAuthContext();

  return createPortal(
    <AnimatePresence>
      {open && (
        <Motion.div
          className="fixed inset-0 z-[110] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-primary-950/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <Motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col gap-4 border-r bg-surface px-4 py-5"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-lg p-2 text-muted transition hover:bg-muted/10 hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.name}
                  match={item.match}
                  badge={item.name === "Notifications" ? unread : 0}
                  onClick={onClose}
                />
              ))}
              {user?.isAdmin &&
                adminNavItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.name}
                    match={item.match}
                    end={item.end}
                    onClick={onClose}
                  />
                ))}
            </nav>

            <div className="space-y-2 border-t pt-3">
              <Link
                to="/settings"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-muted/8"
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
                  <p className="truncate text-xs text-muted">{user?.email}</p>
                </div>
                <Settings className="h-4 w-4 text-muted" />
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium text-muted transition hover:text-accent-600"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </Motion.aside>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
