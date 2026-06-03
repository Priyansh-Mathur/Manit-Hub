import { Check, CheckCheck } from "lucide-react";
import { cn } from "../../lib/cn";

export default function MessageBubble({ message, isOwn }) {
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs rounded-2xl px-3.5 py-2 lg:max-w-md",
          isOwn
            ? "rounded-br-md bg-primary-600 text-white"
            : "rounded-bl-md border bg-surface text-fg"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[11px]",
            isOwn ? "text-primary-100" : "text-muted"
          )}
        >
          {formatTime(message.createdAt)}
          {isOwn &&
            (message.readAt ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </div>
      </div>
    </div>
  );
}
