import { createContext, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

const ToastContext = createContext(null);

const getId = () => Math.random().toString(36).slice(2);

const meta = {
  success: { icon: CheckCircle2, ring: "ring-success-500/30", color: "text-success-600", bar: "bg-success-500" },
  error: { icon: AlertCircle, ring: "ring-danger-500/30", color: "text-danger-600", bar: "bg-danger-500" },
  info: { icon: Info, ring: "ring-primary-500/30", color: "text-primary-600", bar: "bg-primary-500" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, type = "info", duration = 3200) => {
      const id = getId();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-[min(92vw,360px)] flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const m = meta[toast.type] || meta.info;
            const Icon = m.icon;
            return (
              <Motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className={cn(
                  "pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border bg-surface/95 p-3.5 pr-9 shadow-lift ring-1 backdrop-blur",
                  m.ring
                )}
              >
                <span className={cn("absolute inset-y-0 left-0 w-1", m.bar)} />
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", m.color)} />
                <p className="text-sm font-medium text-fg">{toast.message}</p>
                <button
                  onClick={() => remove(toast.id)}
                  aria-label="Dismiss"
                  className="absolute right-2 top-2 rounded-md p-1 text-muted transition hover:text-fg"
                >
                  <X size={14} />
                </button>
              </Motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export { ToastContext };
