import { Link } from "react-router-dom";
import { Home, ArrowLeft, Compass } from "lucide-react";
import Logo from "../components/brand/Logo";

const shortcuts = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/study-groups", label: "Study Groups" },
  { to: "/messages", label: "Messages" },
  { to: "/campus-maps", label: "Campus Maps" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="px-6 py-5 sm:px-10">
        <Link to="/" className="w-fit">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-600/10 text-primary-600">
            <Compass className="h-9 w-9" />
          </div>

          <div className="font-display text-7xl font-black tracking-tight text-primary-600 sm:text-8xl">
            404
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            The page you tried to open doesn’t exist or was moved. Use a shortcut
            below to get back to the parts of Manit Hub you need.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="ring-focus inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              <Home className="h-5 w-5" />
              Go to dashboard
            </Link>
            <Link
              to="/"
              className="ring-focus inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold text-fg transition hover:bg-muted/10"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to home
            </Link>
          </div>

          <div className="mt-12 rounded-3xl border bg-surface p-6 text-left shadow-card">
            <p className="mb-4 text-sm font-medium text-muted">
              Try one of these destinations
            </p>
            <div className="flex flex-wrap gap-2.5">
              {shortcuts.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="ring-focus rounded-full bg-muted/12 px-4 py-2 text-sm font-medium text-fg transition hover:bg-primary-600/10 hover:text-primary-600"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
