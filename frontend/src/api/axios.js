import axios from "axios";
import { clearAuth } from "../utils/authStorage";

// Priority:
//  1. VITE_API_URL (explicit backend, e.g. http://localhost:5001) -> "<url>/api"
//  2. dev -> "/api" (served through the Vite dev proxy, avoids CORS locally)
//  3. production build with no env -> the hosted backend
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.DEV
  ? "/api"
  : "https://manit-hub-eq95.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global handling for a suspended account. The backend tags both the login
// rejection and every authenticated-request rejection with
// code === "ACCOUNT_SUSPENDED". If a logged-in user is suspended mid-session,
// wipe the local session and send them straight to the login page. When the
// user is already on /auth (a fresh login attempt), let LoginForm show the
// inline message instead of reloading the page.
api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.data?.code === "ACCOUNT_SUSPENDED") {
      const onAuthPage = window.location.pathname.startsWith("/auth");
      if (!onAuthPage) {
        // Fire-and-forget clear (localStorage part is synchronous) then bounce.
        clearAuth();
        window.location.assign("/auth?suspended=1");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
