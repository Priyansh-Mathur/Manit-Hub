import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import socketService from "../utils/socket";

// Default value keeps consumers safe even if the provider isn't mounted.
const PresenceContext = createContext({
  isOnline: () => false,
  setOnline: () => {},
  markOnline: () => {},
  markOffline: () => {},
});

export function PresenceProvider({ children }) {
  // Set of user-id strings currently online (among my friends).
  const [online, setOnlineSet] = useState(() => new Set());

  const isOnline = useCallback((id) => online.has(String(id)), [online]);

  const setOnline = useCallback((ids) => {
    setOnlineSet(new Set((ids || []).map(String)));
  }, []);

  const markOnline = useCallback((id) => {
    setOnlineSet((prev) => {
      const next = new Set(prev);
      next.add(String(id));
      return next;
    });
  }, []);

  const markOffline = useCallback((id) => {
    setOnlineSet((prev) => {
      const next = new Set(prev);
      next.delete(String(id));
      return next;
    });
  }, []);

  // Own the app-wide socket connection and listen for presence deltas.
  useEffect(() => {
    socketService.connect();
    socketService.onPresenceSnapshot(({ online: ids }) => setOnline(ids || []));
    socketService.onFriendOnline(({ userId }) => markOnline(userId));
    socketService.onFriendOffline(({ userId }) => markOffline(userId));
    return () => {
      socketService.offPresence();
      socketService.disconnect();
    };
  }, [setOnline, markOnline, markOffline]);

  const value = useMemo(
    () => ({ isOnline, setOnline, markOnline, markOffline }),
    [isOnline, setOnline, markOnline, markOffline]
  );

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export { PresenceContext };
