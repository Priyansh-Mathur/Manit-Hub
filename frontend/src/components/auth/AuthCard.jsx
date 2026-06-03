import { Crest } from "../brand/Logo";

export default function AuthCard({ mode, setMode, children }) {
  const isAuthMode = mode === "login" || mode === "signup";

  const subtitle = {
    login: "Welcome back — sign in to continue.",
    signup: "Join the MANIT campus community.",
    forgot: "We’ll help you reset your password.",
    reset: "Set a new password for your account.",
  }[mode];

  return (
    <div className="w-full">
      <div className="mb-7 flex flex-col items-center text-center lg:hidden">
        <Crest className="h-12 w-12" />
      </div>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg">
          {mode === "login" && "Sign in to Manit Hub"}
          {mode === "signup" && "Create your account"}
          {mode === "forgot" && "Reset your password"}
          {mode === "reset" && "Set a new password"}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
      </div>

      <div className="rounded-2xl border bg-surface p-6 shadow-card sm:p-7">
        {children}

        {isAuthMode && (
          <div className="mt-6 border-t pt-5 text-center text-sm">
            {mode === "login" ? (
              <>
                <span className="text-muted">Don’t have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-semibold text-primary-600 transition hover:text-primary-700"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                <span className="text-muted">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold text-primary-600 transition hover:text-primary-700"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
