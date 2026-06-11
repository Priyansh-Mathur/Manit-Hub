import { useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import EmptyState from "../ui/EmptyState";
import { addDocumentComment } from "../../api/documents";
import { useToast } from "../ui/useToast";

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

export default function DocCommentsModal({ doc, open, onClose, onCommentAdded }) {
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const { show } = useToast();
  const comments = doc.comments || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || sending) return;
    setSending(true);
    try {
      const created = await addDocumentComment(doc._id, comment);
      onCommentAdded?.(doc._id, created);
      setComment("");
    } catch (err) {
      console.error("Comment failed", err);
      show(err?.response?.data?.message || "Could not post comment", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={MessageSquareText}
      title="Comments"
      description={doc.title}
    >
      <div className="flex max-h-[60vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-6 pb-3">
          {comments.length === 0 ? (
            <EmptyState
              icon={MessageSquareText}
              title="No comments yet"
              description="Reviewed these notes? Tell your campus if they're worth the download."
              className="py-8"
            />
          ) : (
            comments.map((c) => (
              <div key={c._id} className="flex items-start gap-3">
                <Avatar
                  src={c.author?.avatarUrl}
                  name={c.author?.displayName || "Student"}
                  size="xs"
                />
                <div className="min-w-0 flex-1 rounded-xl bg-surface px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-fg">
                      {c.author?.displayName || "Student"}
                    </span>
                    <span className="text-[11px] text-muted">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-fg">
                    {c.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t p-4"
        >
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            maxLength={500}
            className="field flex-1"
          />
          <Button
            type="submit"
            size="sm"
            loading={sending}
            disabled={!comment.trim()}
            aria-label="Post comment"
          >
            <Send size={14} />
          </Button>
        </form>
      </div>
    </Modal>
  );
}
