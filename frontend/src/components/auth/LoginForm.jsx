import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import api from "../../api/axios";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { isValidScholarEmail, SCHOLAR_EMAIL_MESSAGE } from "../../utils/validation";

export default function LoginForm({ onForgot }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidScholarEmail(email)) {
      setError(SCHOLAR_EMAIL_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      // backend returns { data: { user, token } }
      login(res.data?.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email"
        icon={Mail}
        type="email"
        placeholder="2311401XXX@stu.manit.ac.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

      {onForgot && (
        <button
          type="button"
          onClick={onForgot}
          className="ring-focus w-full rounded-lg py-1 text-sm font-medium text-muted transition hover:text-primary-600"
        >
          Forgot your password?
        </button>
      )}
    </form>
  );
}
