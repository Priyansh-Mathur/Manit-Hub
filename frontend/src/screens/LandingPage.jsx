import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useAuthContext } from "../context/useAuthContext";
import {
  ShoppingBag,
  Users,
  MessageCircle,
  Map,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Minus,
  Building2,
} from "lucide-react";
import Logo, { Crest } from "../components/brand/Logo";
import ThemeToggle from "../components/ui/ThemeToggle";

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

const features = [
  {
    icon: ShoppingBag,
    title: "Student Marketplace",
    desc: "Buy and sell textbooks, cycles, calculators and hostel essentials with verified MANIT students — pay securely over UPI.",
    span: "lg:col-span-3",
  },
  {
    icon: Users,
    title: "Study Groups",
    desc: "Form branch-wise study circles, schedule sessions and share notes for every department.",
    span: "lg:col-span-3",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    desc: "Message sellers and group-mates instantly with read receipts.",
    span: "lg:col-span-2",
  },
  {
    icon: Map,
    title: "Campus Maps",
    desc: "Find departments, hostels, canteens and the Central Library across the MANIT campus.",
    span: "lg:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "Students only",
    desc: "Sign up with your @stu.manit.ac.in identity — a trusted, on-campus community.",
    span: "lg:col-span-2",
  },
];

const departments = [
  "CSE",
  "ECE",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Architecture & Planning",
  "MSME",
  "Mathematics",
  "Physics",
  "Chemistry",
  "MBA",
  "MCA",
];

const stats = [
  { number: "10K+", label: "Students on campus" },
  { number: "15+", label: "Departments & centres" },
  { number: "1960", label: "Serving since" },
];

const faqs = [
  {
    q: "Who can join Manit Hub?",
    a: "Any current student of Maulana Azad National Institute of Technology (NIT Bhopal). Sign up with your institute email to join the verified campus community.",
  },
  {
    q: "Is it free to use?",
    a: "Yes — Manit Hub is free for all MANIT students. No subscriptions, no clutter.",
  },
  {
    q: "How do payments work in the marketplace?",
    a: "Buyers and sellers connect over chat and settle directly via UPI. Sellers can add their UPI ID and QR code to their profile.",
  },
  {
    q: "Is Manit Hub an official institute portal?",
    a: "Manit Hub is a student-built companion app for campus life. For official notices and academics, always refer to manit.ac.in.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border bg-surface px-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ring-focus flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-fg">{q}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600/10 text-primary-600">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <Motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden pb-5 text-sm leading-6 text-muted"
        >
          {a}
        </Motion.p>
      )}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuthContext();
  // Already logged in (session restored from storage)? Skip the marketing page
  // and go straight into the app. Without this, reopening the app/site lands on
  // this logged-out-looking page even though the session is still valid — which
  // is what made it feel like you were logged out on every launch.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/auth"
              className="ring-focus hidden rounded-xl px-4 py-2 text-sm font-semibold text-fg transition hover:bg-muted/10 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="ring-focus inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-10 sm:px-6">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-primary-800/40 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 px-6 py-16 text-white shadow-lift sm:px-12 sm:py-24"
        >
          <div className="bg-grid absolute inset-0 opacity-[0.25]" />
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200 backdrop-blur">
              <Crest className="h-4 w-4" />
              An Institute of National Importance · Estd. 1960
            </span>

            <h1 className="mt-7 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Campus life at{" "}
              <span className="bg-gradient-to-r from-white to-gold-200 bg-clip-text text-transparent">
                NIT Bhopal
              </span>
              , finally in one place.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-primary-100/90 sm:text-lg">
              Manit Hub brings the marketplace, study groups, chat and campus
              maps of Maulana Azad National Institute of Technology together —
              built by students, for students.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth"
                className="ring-focus inline-flex items-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 text-base font-bold text-primary-950 shadow-brutal transition hover:bg-gold-300"
              >
                Get started free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="https://youtu.be/4ngVWX2E0rU"
                target="_blank"
                rel="noreferrer"
                className="ring-focus inline-flex items-center justify-center rounded-xl border-2 border-white/25 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Watch demo
              </a>
            </div>

            <p className="mt-8 font-display text-sm italic text-gold-200/90">
              “Education is our soul wealth.”
            </p>
          </div>
        </Motion.div>
      </section>

      {/* Departments strip */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Built for every branch on campus
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {departments.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3.5 py-1.5 text-sm font-medium text-muted"
              >
                <Building2 className="h-3.5 w-3.5 text-primary-500" />
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6">
        <Motion.div
          {...reveal}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border bg-surface p-7 text-center shadow-card"
            >
              <div className="font-display text-4xl font-extrabold text-primary-600">
                {s.number}
              </div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </Motion.div>
      </section>

      {/* Features bento */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Motion.div {...reveal} className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-600/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Sparkles className="h-4 w-4" />
              Everything, in one hub
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
              Not another portal. A campus companion.
            </h2>
          </Motion.div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className={`group rounded-3xl border bg-surface p-7 shadow-card transition hover:-translate-y-1 hover:shadow-lift ${f.span}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-fg">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{f.desc}</p>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="px-4 pb-20 sm:px-6">
        <Motion.div
          {...reveal}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary-800 to-primary-950 px-6 py-16 text-center text-white sm:px-12"
        >
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Join your campus ecosystem
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-100/90">
              Free forever for MANIT students. No spam, no clutter — just
              campus life, organised.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-primary-100">
              {["Free to use", "Institute email sign-up", "Instant access"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gold-300" />
                    {item}
                  </span>
                )
              )}
            </div>

            <Link
              to="/auth"
              className="ring-focus mt-9 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-8 py-4 text-base font-bold text-primary-950 shadow-brutal transition hover:bg-gold-300"
            >
              Start using Manit Hub
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </Motion.div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Motion.h2
            {...reveal}
            className="mb-8 text-center font-display text-3xl font-extrabold tracking-tight text-fg"
          >
            Frequently asked questions
          </Motion.h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Logo />
            <p className="max-w-md text-sm text-muted">
              Maulana Azad National Institute of Technology, Bhopal — An
              Institute of National Importance.
            </p>
            <p className="font-display text-sm italic text-primary-600">
              “Education is our soul wealth.”
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <Link to="/auth" className="transition hover:text-fg">
                Sign in
              </Link>
              <a
                href="https://www.manit.ac.in/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-fg"
              >
                Institute website
              </a>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-xs text-muted">
            © {new Date().getFullYear()} Manit Hub — built by students, for
            students. Not an official institute portal.
          </div>
        </div>
      </footer>
    </div>
  );
}
