import { useState } from "react";
import api from "../../api/axios";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function ForgotPasswordForm({ onBack, onSent }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      const token = res.data?.data?.resetToken;
      setInfo("If the email exists, a reset link was sent.");
      if (onSent) onSent(token);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
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
        {loading ? "Sending…" : "Send reset link"}
      </Button>

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
