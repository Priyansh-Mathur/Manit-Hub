import { ShoppingBag, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Crest } from "../brand/Logo";

export default function WelcomeHero({ user }) {
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary-800/40 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 p-7 text-white shadow-card sm:p-9">
      <div className="bg-grid absolute inset-0 opacity-20" />
      <div className="absolute -right-12 -top-10 h-56 w-56 rounded-full bg-gold-400/15 blur-3xl" />
      <Crest className="absolute -bottom-8 right-4 h-44 w-44 opacity-[0.12] sm:right-10" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
          {today}
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {getGreeting()}, {user?.displayName || "Student"} 👋
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-primary-100/90">
          Stay connected with the MANIT campus community. Explore the
          marketplace, join study groups, and find your way around — all in one
          place.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/marketplace")}
            className="ring-focus inline-flex items-center gap-2 rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-bold text-primary-950 shadow-sm transition hover:bg-gold-300"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse marketplace
          </button>
          <button
            onClick={() => navigate("/study-groups")}
            className="ring-focus inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Users className="h-4 w-4" />
            Explore groups
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
