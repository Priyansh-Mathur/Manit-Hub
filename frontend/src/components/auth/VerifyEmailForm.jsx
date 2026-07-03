import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import api from "../../api/axios";
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailForm({ email, onBack }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-email", { email, code });
      // backend returns { data: { user, token } } — same shape as login
      login(res.data?.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);

    try {
      await api.post("/auth/resend-verification", { email });
      setInfo("A new code was sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend the code");
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted">
        We sent a 6-digit code to <span className="font-medium text-fg">{email}</span>.
        It expires in 30 minutes.
      </p>

      <Input
        label="Verification code"
        icon={KeyRound}
        inputMode="numeric"
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />

      {info && (
        <div className="flex items-start gap-2 rounded-xl border border-success-500/30 bg-success-500/10 px-3.5 py-2.5 text-sm text-success-700 dark:text-success-500">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{info}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-sm text-danger-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={loading}>
        {loading ? "Verifying…" : "Verify & sign in"}
      </Button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="ring-focus w-full rounded-lg py-1 text-sm font-medium text-muted transition hover:text-primary-600 disabled:opacity-60"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="ring-focus inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-1 text-sm font-medium text-muted transition hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>
    </form>
  );
}
