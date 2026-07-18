import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useAuthContext } from "../context/useAuthContext";
import api from "../api/axios";
import { ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";

/**
 * Secret CEO/owner login. Reached by navigating directly to /admin/login —
 * there is no link to it anywhere in the app. Authenticates against the
 * backend ADMIN_ID / ADMIN_PASSWORD (not a student email).
 */
export default function AdminLogin() {
  const { login } = useAuth();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already an admin? Straight to the console.
  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/admin-login", { adminId, password });
      login(res.data?.data);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-bg text-fg">
      <div className="flex items-center justify-end px-6 py-5">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <h1 className="font-display text-2xl font-extrabold">Admin Console</h1>
            <p className="mt-1 text-sm text-muted">
              Restricted access · authorized personnel only
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border bg-surface p-6 shadow-sm"
          >
            <Input
              label="Admin ID"
              icon={User}
              type="text"
              autoComplete="off"
              placeholder="Enter admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
            />

            <Input
              label="Password"
              icon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onRightIconClick={() => setShowPassword((prev) => !prev)}
              required
            />

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-sm text-danger-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
