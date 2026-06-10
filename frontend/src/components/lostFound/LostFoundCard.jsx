import { useState } from "react";
import { MessageCircle, CheckCircle, Trash2, MapPin, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { messagesApi } from "../../api/messages";
import { updateLostFoundStatus, deleteLostFoundItem } from "../../api/lostFound";
import { useAuthContext } from "../../context/useAuthContext";
import { useToast } from "../ui/useToast";
import { PLACEHOLDER_LISTING } from "../../lib/images";
import { cn } from "../../lib/cn";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import ConfirmModal from "../ui/ConfirmModal";

export default function LostFoundCard({ item, onChanged, onDeleted }) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { show } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isReporter = user && item.reporter?._id === user._id;
  const returned = item.status === "returned";

  const handleMessage = async () => {
    try {
      await messagesApi.createConversation({
        listingId: item._id,
        participantId: item.reporter._id,
        contextType: "lostfound",
      });
      navigate("/messages");
    } catch (err) {
      console.error("Error starting conversation:", err);
      show("Could not start conversation", "error");
    }
  };

  const handleToggleStatus = async () => {
    try {
      const updated = await updateLostFoundStatus(
        item._id,
        returned ? "open" : "returned"
      );
      onChanged?.(updated);
      show(returned ? "Marked as open again" : "Marked as returned 🎉", "success");
    } catch (err) {
      console.error("Error updating status:", err);
      show("Could not update status", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLostFoundItem(item._id);
      onDeleted?.(item._id);
      show("Post removed", "success");
    } catch (err) {
      console.error("Error deleting item:", err);
      show("Failed to remove post", "error");
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/10">
        <img
          src={item.images?.[0] || PLACEHOLDER_LISTING}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_LISTING;
          }}
          className={cn(
            "h-full w-full object-cover transition duration-500 group-hover:scale-105",
            returned && "opacity-60"
          )}
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <Badge tone={item.kind === "lost" ? "danger" : "success"}>
            {item.kind === "lost" ? "Lost" : "Found"}
          </Badge>
          {returned && <Badge tone="gold">Returned</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug text-fg line-clamp-2">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{item.category}</p>

        {item.location && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} /> {item.location}
          </p>
        )}

        {item.description && (
          <p className="mt-2 text-sm text-muted line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              src={item.reporter?.avatarUrl}
              name={item.reporter?.displayName || "Student"}
              size="xs"
            />
            <span className="truncate text-sm font-medium text-fg">
              {item.reporter?.displayName || "Unknown"}
            </span>
          </div>

          {!isReporter && user && !returned && (
            <button
              type="button"
              onClick={handleMessage}
              aria-label="Message poster"
              className="ring-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-surface text-muted transition hover:border-primary-500/40 hover:text-primary-600"
            >
              <MessageCircle size={16} />
            </button>
          )}
        </div>

        {isReporter && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              className="ring-focus inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-600/10 px-2 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-600/20 dark:text-primary-200"
            >
              {returned ? (
                <>
                  <RotateCcw size={13} /> Reopen
                </>
              ) : (
                <>
                  <CheckCircle size={13} /> Returned
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="ring-focus inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-danger-500/30 px-2 py-1.5 text-xs font-medium text-danger-600 transition hover:bg-danger-500/10"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Remove this post?"
        description="The post will no longer be visible on the Lost & Found board."
        confirmText="Remove"
        tone="danger"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDelete();
        }}
      />
    </div>
  );
}
