import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchNotifications } from "../api/notifications";

/** Lightweight poll of the unread notification count, refreshed on navigation. */
export default function useUnreadCount() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchNotifications({ read: "false", limit: 1 });
        const c = res?.data?.meta?.unreadCount ?? 0;
        if (active) setCount(c);
      } catch {
        if (active) setCount(0);
      }
    })();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  return count;
}
