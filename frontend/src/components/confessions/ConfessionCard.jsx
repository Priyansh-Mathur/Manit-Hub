import { useState } from "react";
import {
  MessageCircle,
  Flag,
  Trash2,
  Send,
  VenetianMask,
} from "lucide-react";
import { cn } from "../../lib/cn";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import { useToast } from "../ui/useToast";
import {
  reactToConfession,
  commentOnConfession,
  reportConfession,
  deleteConfession,
} from "../../api/confessions";

const REACTIONS = [
  { type: "heart", emoji: "❤️" },
  { type: "laugh", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "sad", emoji: "😢" },
];

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function ConfessionCard({ confession, onChanged, onDeleted }) {
  const { show } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleReact = async (type) => {
    try {
      const updated = await reactToConfession(confession._id, type);
      onChanged?.(updated);
    } catch (err) {
      console.error("Reaction failed", err);
      show("Could not react", "error");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || sending) return;
    setSending(true);
    try {
      const updated = await commentOnConfession(confession._id, comment);
      onChanged?.(updated);
      setComment("");
    } catch (err) {
      console.error("Comment failed", err);
      show(err?.response?.data?.message || "Could not post reply", "error");
    } finally {
      setSending(false);
    }
  };

  const handleReport = async () => {
    try {
      await reportConfession(confession._id, "");
      show("Reported — our moderators will take a look", "success");
      onChanged?.({ ...confession, reportedByMe: true });
    } catch (err) {
      console.error("Report failed", err);
      show(err?.response?.data?.message || "Could not report", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConfession(confession._id);
      onDeleted?.(confession._id);
      show("Confession deleted", "success");
    } catch (err) {
      console.error("Delete failed", err);
      show("Could not delete confession", "error");
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-600/20 to-accent-600/20 text-primary-600">
            <VenetianMask className="h-4.5 w-4.5" size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-fg">
              Anonymous
              {confession.isMine && (
                <Badge tone="primary" className="ml-2">
                  You
                </Badge>
              )}
            </p>
            <p className="text-xs text-muted">{timeAgo(confession.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!confession.isMine && !confession.reportedByMe && (
            <button
              type="button"
              onClick={() => setShowReport(true)}
              aria-label="Report confession"
              title="Report"
              className="ring-focus rounded-lg p-1.5 text-muted transition hover:bg-warning-500/10 hover:text-warning-600"
            >
              <Flag size={14} />
            </button>
          )}
          {confession.isMine && (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              aria-label="Delete confession"
              className="ring-focus rounded-lg p-1.5 text-muted transition hover:bg-danger-500/10 hover:text-danger-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-fg">
        {confession.content}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t pt-3">
        {REACTIONS.map(({ type, emoji }) => {
          const count = confession.reactionCounts?.[type] || 0;
          const active = confession.myReaction === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleReact(type)}
              aria-label={`React ${type}`}
              className={cn(
                "ring-focus inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition",
                active
                  ? "border-primary-600 bg-primary-600/10"
                  : "bg-surface hover:border-primary-500/40"
              )}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "text-xs font-semibold",
                    active ? "text-primary-600" : "text-muted"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className={cn(
            "ring-focus ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
            showComments
              ? "border-primary-600 bg-primary-600/10 text-primary-600"
              : "bg-surface text-muted hover:text-fg"
          )}
        >
          <MessageCircle size={14} />
          {confession.commentCount > 0 ? confession.commentCount : "Reply"}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2.5">
          {confession.comments.map((c) => (
            <div key={c._id} className="rounded-xl bg-surface px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-bold",
                    c.handle === "OP" ? "text-accent-600" : "text-primary-600"
                  )}
                >
                  {c.handle}
                </span>
                {c.isMine && <Badge tone="neutral">you</Badge>}
                <span className="text-[11px] text-muted">
                  {timeAgo(c.createdAt)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-fg">
                {c.content}
              </p>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex items-center gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Reply anonymously…"
              maxLength={500}
              className="field flex-1"
            />
            <Button
              type="submit"
              size="sm"
              loading={sending}
              disabled={!comment.trim()}
              aria-label="Send reply"
            >
              <Send size={14} />
            </Button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={showDelete}
        title="Delete this confession?"
        description="It will disappear from the feed for everyone."
        confirmText="Delete"
        tone="danger"
        onCancel={() => setShowDelete(false)}
        onConfirm={() => {
          setShowDelete(false);
          handleDelete();
        }}
      />

      <ConfirmModal
        open={showReport}
        title="Report this confession?"
        description="It will be reviewed and hidden automatically if enough students report it."
        confirmText="Report"
        tone="danger"
        onCancel={() => setShowReport(false)}
        onConfirm={() => {
          setShowReport(false);
          handleReport();
        }}
      />
    </div>
  );
}
