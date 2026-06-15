import { MessageCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import Avatar from "../ui/Avatar";
import EmptyState from "../ui/EmptyState";
import { usePresence } from "../../context/usePresence";

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUser,
}) {
  const { isOnline } = usePresence();
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getOtherParticipant = (participants) =>
    participants.find((p) => p._id !== currentUser._id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <MessageCircle className="h-5 w-5 text-primary-600" />
        <h2 className="font-display text-lg font-bold text-fg">Messages</h2>
        <span className="ml-auto rounded-full bg-muted/15 px-2 py-0.5 text-xs font-semibold text-muted">
          {conversations.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            description="Message a seller from the marketplace to start chatting."
            className="m-3 border-0 bg-transparent py-10"
          />
        ) : (
          conversations.map((conversation) => {
            const other = getOtherParticipant(conversation.participants);
            const isSelected = selectedConversation?._id === conversation._id;
            const unread = conversation.unreadCount > 0;
            const isFriendDm = conversation.contextType === "friend";

            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  "ring-focus flex w-full items-center gap-3 border-b px-4 py-3 text-left transition",
                  isSelected ? "bg-primary-600/10" : "hover:bg-muted/8"
                )}
              >
                <Avatar
                  src={other?.avatarUrl || other?.avatar}
                  name={other?.displayName || "?"}
                  size="md"
                  online={isFriendDm ? isOnline(other?._id) : undefined}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={cn(
                        "truncate text-sm",
                        unread ? "font-bold text-fg" : "font-semibold text-fg"
                      )}
                    >
                      {other?.displayName || "Unknown user"}
                    </h3>
                    {conversation.lastMessageAt && (
                      <span className="shrink-0 text-xs text-muted">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-muted">
                      {conversation.lastMessage ||
                        conversation.listingTitle ||
                        (isFriendDm ? "Direct message" : "")}
                    </p>
                    {unread && (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent-600 px-1.5 text-[11px] font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
