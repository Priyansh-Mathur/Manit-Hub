import { createContext, useState } from "react";
import { persistAuth, clearAuth } from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (!saved || saved === "undefined" || saved === "null") {
      return null;
    }
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && !parsed._id) {
        parsed._id = parsed.id;
      }
      return parsed;
    } catch (err) {
      console.warn("Invalid user in localStorage, clearing.", err);
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = ({ user, token }) => {
    const normalizedUser = user && user.id && !user._id
      ? { ...user, _id: user.id }
      : user;
    // Write-through to durable native storage (+ localStorage mirror). Not
    // awaited: the localStorage writes inside persistAuth are synchronous, so
    // the token is usable immediately; the native write finishes in the
    // background. See utils/authStorage.js.
    persistAuth({ user: normalizedUser, token });
    setUser(normalizedUser);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
