import axios from "axios";

// Priority:
//  1. VITE_API_URL (explicit backend, e.g. http://localhost:5001) -> "<url>/api"
//  2. dev -> "/api" (served through the Vite dev proxy, avoids CORS locally)
//  3. production build with no env -> the hosted backend
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.DEV
  ? "/api"
  : "https://manithub-backend.vercel.app/api";

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

export default api;
