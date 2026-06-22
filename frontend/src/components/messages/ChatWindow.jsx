import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import MessageBubble from "./MessageBubble";

// WhatsApp-style day separators: "Today", "Yesterday", else a full date.
const isSameDay = (a, b) => {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
};

const formatDateLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
};
import { messagesApi } from "../../api/messages";
import socketService from "../../utils/socket";
import Avatar from "../ui/Avatar";
import Spinner from "../ui/Spinner";

export default function ChatWindow({ conversation, currentUser, onRead, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadMessages = useCallback(
    async (nextPage) => {
      if (!conversation?._id) return;
      try {
        setLoading(true);
        const response = await messagesApi.getMessages(conversation._id, {
          page: nextPage,
          limit: 30,
        });
        const payload = response.data?.data || {};
        const incoming = payload.messages || [];

        setMessages((prev) =>
          nextPage === 1 ? incoming : [...incoming, ...prev]
        );
        setPage(nextPage);
        setHasMore(payload.meta && payload.meta.page < payload.meta.totalPages);

        socketService.markRead(conversation._id);
        messagesApi.markConversationRead(conversation._id).catch(() => {});
        if (onRead) onRead();
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [conversation?._id, onRead]
  );

  useEffect(() => {
    if (conversation && currentUser?._id) {
      setMessages([]);
      setPage(1);
      setHasMore(false);
      loadMessages(1);
      socketService.joinConversation(conversation._id);

      socketService.onReceiveMessage((message) => {
        // The shared socket can be in several rooms (e.g. after a reconnect
        // re-join), so only append messages for the conversation on screen.
        if (String(message.conversation) !== String(conversation._id)) return;
        // De-dupe by _id: the sender already appended this from the REST
        // response, and a reconnect can re-deliver.
        setMessages((prev) =>
          prev.some((m) => m._id === message._id) ? prev : [...prev, message]
        );
        if (message.sender !== currentUser._id) {
          socketService.markRead(conversation._id);
          messagesApi.markConversationRead(conversation._id).catch(() => {});
          if (onRead) onRead();
        }
      });

      socketService.onMessagesRead(({ conversationId }) => {
        if (conversationId === conversation._id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.sender === currentUser._id && !msg.readAt
                ? { ...msg, readAt: new Date().toISOString() }
                : msg
            )
          );
        }
      });

      return () => {
        socketService.offReceiveMessage();
        socketService.offMessagesRead();
        // Stop re-joining this room once it's no longer on screen, so a later
        // reconnect only restores the conversation the user actually has open.
        socketService.leaveConversation(conversation._id);
      };
    }
  }, [conversation, currentUser?._id, loadMessages, onRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fallback delivery for environments with no live socket (e.g. the serverless
  // deploy): poll for new messages while a conversation is open. Skips the
  // fetch whenever the socket is connected, so it's a no-op in real-time mode.
  useEffect(() => {
    if (!conversation?._id || !currentUser?._id) return undefined;
    const interval = setInterval(async () => {
      if (socketService.isConnected()) return;
      try {
        const res = await messagesApi.getMessages(conversation._id, {
          page: 1,
          limit: 30,
        });
        const incoming = res.data?.data?.messages || [];
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m._id));
          const fresh = incoming.filter((m) => !seen.has(m._id));
          if (!fresh.length) return prev;
          // Mark the conversation read since the user is looking at it.
          messagesApi.markConversationRead(conversation._id).catch(() => {});
          if (onRead) onRead();
          return [...prev, ...fresh];
        });
      } catch {
        /* ignore transient poll errors */
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [conversation?._id, currentUser?._id, onRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content) return;
    setNewMessage("");
    setSendError("");
    try {
      // Send over REST so it works even with no live socket (e.g. the
      // serverless deploy). When the socket IS connected the server also
      // pushes this to the other person in real time; we de-dupe by _id.
      const res = await messagesApi.sendMessage(conversation._id, content);
      const saved = res.data?.data;
      if (saved) {
        setMessages((prev) =>
          prev.some((m) => m._id === saved._id) ? prev : [...prev, saved]
        );
      }
      if (onRead) onRead();
    } catch (err) {
      console.error("Error sending message:", err);
      setSendError("Couldn't send your message. Please try again.");
      setNewMessage(content); // restore so it isn't lost
    }
  };

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600">
            <MessageSquare size={26} />
          </div>
          <h3 className="font-display text-lg font-bold text-fg">
            No conversation selected
          </h3>
          <p className="mt-1 text-sm text-muted">
            Choose a conversation to start messaging.
          </p>
        </div>
      </div>
    );
  }

  const other = conversation.participants.find((p) => p._id !== currentUser._id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="ring-focus -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-muted/10 hover:text-fg md:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        <Avatar
          src={other?.avatarUrl || other?.avatar}
          name={other?.displayName || "?"}
          size="sm"
        />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-fg">
            {other?.displayName || "Unknown user"}
          </h3>
          <p className="truncate text-xs text-muted">
            {conversation.listingTitle}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-bg p-4">
        {loading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size={24} />
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => loadMessages(page + 1)}
                  className="ring-focus rounded-full border bg-surface px-3 py-1 text-xs font-medium text-muted transition hover:text-fg"
                >
                  Load earlier messages
                </button>
              </div>
            )}
            {messages.map((message, i) => {
              const prev = messages[i - 1];
              const showDate =
                !prev || !isSameDay(prev.createdAt, message.createdAt);
              return (
                <Fragment key={message._id}>
                  {showDate && (
                    <div className="flex justify-center py-1">
                      <span className="rounded-full bg-muted/15 px-3 py-1 text-[11px] font-medium text-muted">
                        {formatDateLabel(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={message.sender === currentUser._id}
                  />
                </Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t bg-surface p-3">
        {sendError && (
          <p className="mb-2 text-center text-xs text-red-500">{sendError}</p>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            className="field rounded-full"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            aria-label="Send message"
            className="ring-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
