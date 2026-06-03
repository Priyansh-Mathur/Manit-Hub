import { useState, useEffect, useCallback } from "react";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";
import { messagesApi } from "../api/messages";
import { useAuthContext } from "../context/useAuthContext";
import socketService from "../utils/socket";
import { cn } from "../lib/cn";
import Skeleton from "../components/ui/Skeleton";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  const loadConversations = useCallback(async () => {
    try {
      const response = await messagesApi.getConversations();
      setConversations(response.data?.data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshConversations = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
    socketService.connect();
    socketService.onReceiveMessage(() => loadConversations());
    socketService.onMessagesRead(() => loadConversations());

    return () => {
      socketService.offReceiveMessage();
      socketService.offMessagesRead();
      socketService.disconnect();
    };
  }, [loadConversations]);

  const handleSelectConversation = (conversation) =>
    setSelectedConversation(conversation);

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[480px] overflow-hidden rounded-2xl border bg-card shadow-card">
      <div
        className={cn(
          "w-full shrink-0 border-r md:w-80 lg:w-96",
          selectedConversation && "hidden md:block"
        )}
      >
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentUser={user}
          />
        )}
      </div>

      <div
        className={cn(
          "min-w-0 flex-1",
          !selectedConversation && "hidden md:block"
        )}
      >
        <ChatWindow
          conversation={selectedConversation}
          currentUser={user}
          onRead={refreshConversations}
          onBack={() => setSelectedConversation(null)}
        />
      </div>
    </div>
  );
}
