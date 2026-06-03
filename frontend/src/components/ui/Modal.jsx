import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

const sizes = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
  "2xl": "sm:max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  size = "lg",
  className,
  bodyClassName,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <Motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-primary-950/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <Motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn(
              "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border bg-surface shadow-lift sm:rounded-3xl",
              sizes[size],
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  {Icon && (
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/10 text-primary-600">
                      <Icon className="h-5 w-5" />
                    </span>
                  )}
                  <div>
                    {title && (
                      <h2 className="font-display text-lg font-bold text-fg">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-0.5 text-sm text-muted">{description}</p>
                    )}
                  </div>
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="ring-focus -mr-2 rounded-lg p-2 text-muted transition hover:bg-muted/10 hover:text-fg"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className={cn("min-h-0 flex-1 overflow-y-auto", bodyClassName)}>
              {children}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
