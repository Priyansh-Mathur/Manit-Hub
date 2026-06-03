import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import api from "../../api/axios";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/signup", {
        displayName,
        email,
        password,
      });
      // backend returns { data: { user, token } }
      login(res.data?.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Display name"
        icon={User}
        placeholder="Samay Jain"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />

      <Input
        label="Institute email"
        icon={Mail}
        type="email"
        placeholder="2311401XXX@stu.manit.ac.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hint="Use your MANIT student email to join the verified community."
        required
      />

      <Input
        label="Password"
        icon={Lock}
        type="password"
        minLength={6}
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-sm text-danger-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
