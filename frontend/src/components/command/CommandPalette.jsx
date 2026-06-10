import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  Search,
  CornerDownLeft,
  Home,
  ShoppingBag,
  Users,
  Library,
  Map,
  MessageCircle,
  Bell,
  Settings,
  Plus,
  LogOut,
  GraduationCap,
  CalendarCheck,
  SearchCheck,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAuthContext } from "../../context/useAuthContext";
import { CommandContext } from "./useCommand";

export function CommandProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openCommand = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ openCommand }), [openCommand]);

  return (
    <CommandContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </CommandContext.Provider>
  );
}

function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const groups = useMemo(
    () => [
      {
        group: "Navigate",
        items: [
          { label: "Dashboard", icon: Home, run: () => navigate("/dashboard") },
          { label: "Marketplace", icon: ShoppingBag, run: () => navigate("/marketplace") },
          { label: "Study Groups", icon: Users, run: () => navigate("/study-groups") },
          { label: "Study Vault", icon: Library, run: () => navigate("/study-vault") },
          { label: "CGPA Tracker", icon: GraduationCap, run: () => navigate("/cgpa") },
          { label: "Attendance", icon: CalendarCheck, run: () => navigate("/attendance") },
          { label: "Lost & Found", icon: SearchCheck, run: () => navigate("/lost-found") },
          { label: "Campus Maps", icon: Map, run: () => navigate("/campus-maps") },
          { label: "Messages", icon: MessageCircle, run: () => navigate("/messages") },
          { label: "Notifications", icon: Bell, run: () => navigate("/notifications") },
          { label: "Settings", icon: Settings, run: () => navigate("/settings") },
        ],
      },
      {
        group: "Quick actions",
        items: [
          { label: "List an item for sale", icon: Plus, run: () => navigate("/marketplace") },
          { label: "Create a study group", icon: Users, run: () => navigate("/study-groups") },
          { label: "Upload notes / a document", icon: Library, run: () => navigate("/study-vault") },
          { label: "Track my CGPA", icon: GraduationCap, run: () => navigate("/cgpa") },
          { label: "Mark today's attendance", icon: CalendarCheck, run: () => navigate("/attendance") },
          { label: "Report a lost / found item", icon: SearchCheck, run: () => navigate("/lost-found") },
          { label: "Log out", icon: LogOut, run: () => logout() },
        ],
      },
    ],
    [navigate, logout]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => !q || it.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length);
  }, [groups, query]);

  const flatItems = useMemo(() => filtered.flatMap((g) => g.items), [filtered]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = flatItems[active];
      if (it) {
        onClose();
        it.run();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  let runningIndex = -1;

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        setQuery("");
        setActive(0);
      }}
    >
      {open && (
        <Motion.div
          className="fixed inset-0 z-[130] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-primary-950/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <Motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border bg-surface shadow-lift"
          >
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="h-5 w-5 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search or jump to…"
                className="h-14 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-muted"
              />
              <kbd className="rounded-md border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-muted">
                Esc
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {flatItems.length === 0 ? (
                <div className="px-3 py-10 text-center text-sm text-muted">
                  No results for “{query}”.
                </div>
              ) : (
                filtered.map((group) => (
                  <div key={group.group} className="mb-1">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted/70">
                      {group.group}
                    </p>
                    {group.items.map((it) => {
                      runningIndex += 1;
                      const idx = runningIndex;
                      const isActive = idx === active;
                      const Icon = it.icon;
                      return (
                        <button
                          key={it.label}
                          type="button"
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => {
                            onClose();
                            it.run();
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                            isActive ? "bg-primary-600/10" : "hover:bg-muted/8"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg",
                              isActive
                                ? "bg-primary-600 text-white"
                                : "bg-muted/10 text-muted"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1 font-medium text-fg">
                            {it.label}
                          </span>
                          {isActive && (
                            <CornerDownLeft className="h-4 w-4 text-muted" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
