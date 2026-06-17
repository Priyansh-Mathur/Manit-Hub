import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { ShoppingBag, Users, MessageCircle, Map, ArrowLeft } from "lucide-react";
import Logo, { Crest } from "../components/brand/Logo";
import ThemeToggle from "../components/ui/ThemeToggle";
import AuthCard from "../components/auth/AuthCard";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

const highlights = [
  { icon: ShoppingBag, text: "Buy & sell with verified students" },
  { icon: Users, text: "Branch-wise study groups" },
  { icon: MessageCircle, text: "Real-time campus chat" },
  { icon: Map, text: "Navigate the MANIT campus" },
];

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="bg-grid absolute inset-0 opacity-20" />
      <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />

      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <Crest className="h-10 w-10" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold">Manit Hub</span>
            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold-200">
              NIT Bhopal
            </span>
          </span>
        </Link>
      </div>

      <div className="relative">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
          An Institute of National Importance · Estd. 1960
        </span>
        <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight">
          Your campus,
          <br /> all in one place.
        </h2>
        <p className="mt-4 max-w-sm text-primary-100/85">
          Join the verified community of Maulana Azad National Institute of
          Technology students.
        </p>

        <ul className="mt-8 space-y-3">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-primary-50">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-gold-200">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative font-display text-sm italic text-gold-200/90">
        “Education is our soul wealth.”
      </p>
    </div>
  );
}

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [resetToken, setResetToken] = useState("");

  return (
    <div className="min-h-screen bg-bg text-fg lg:grid lg:grid-cols-2">
      <BrandPanel />

      <div className="relative flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="ring-focus inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted transition hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <AnimatePresence mode="wait">
            <Motion.div
              key={mode}
              className="w-full max-w-[420px]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AuthCard mode={mode} setMode={setMode}>
                {mode === "login" && (
                  <LoginForm onForgot={() => setMode("forgot")} />
                )}
                {mode === "signup" && <SignupForm />}
                {mode === "forgot" && (
                  <ForgotPasswordForm
                    onBack={() => setMode("login")}
                    onSent={(token) => {
                      if (token) setResetToken(token);
                      setMode("reset");
                    }}
                  />
                )}
                {mode === "reset" && (
                  <ResetPasswordForm
                    defaultToken={resetToken}
                    onBack={() => setMode("login")}
                    onReset={() => setMode("login")}
                  />
                )}
              </AuthCard>
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
