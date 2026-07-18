# Manit Hub — Project Brief for Resume Writing

**Prepared for:** resume writer / CV consultant
**Candidate:** Samay Jain — B.Tech student, Maulana Azad National Institute of Technology (MANIT / NIT Bhopal)
**Role on project:** Sole designer, developer and maintainer (solo project — 100% of commits)
**Timeline:** May 2026 – July 2026 (~2 months of active development, ongoing)
**Live web app:** https://manithub-samayjainbm.vercel.app/
**API:** https://manit-hub.onrender.com/api
**Source:** https://github.com/Samay-Jain/Manit-Hub (MIT licensed, public)
**Video tour:** https://youtu.be/4ngVWX2E0rU

---

## 1. One-paragraph summary (the elevator version)

Manit Hub is a full-stack, multi-tenant "student super-app" for the MANIT Bhopal campus, shipped as both a
responsive web application and a native Android app from a single React codebase. It replaces the dozen
disconnected WhatsApp groups, Drive folders and spreadsheets that campus life currently runs on with one
verified, university-scoped platform: a peer-to-peer marketplace with price negotiation and UPI checkout, a
crowdsourced study-notes vault, CGPA and attendance trackers, a timetable with automated class reminders,
an anonymous confessions feed, events and clubs with RSVP, ride-sharing, a StackOverflow-style course Q&A
forum, real-time chat, and campus maps. It is production-deployed across Vercel, Render and MongoDB Atlas,
and was designed with a defence-in-depth security model and a three-layer content moderation pipeline.

---

## 2. Hard numbers (safe to quote on a resume — all verified from the repo)

| Metric | Value |
|---|---|
| Total application code | ~25,700 lines (10,000 backend + 15,700 frontend) |
| Source files authored | ~320 (179 backend `.js`, 141 frontend `.jsx`/`.js`) |
| REST API endpoints | 111 routes across 23 feature domains |
| MongoDB collections / Mongoose models | 21 |
| Route-level frontend screens | 26 |
| Distinct product modules shipped | 20+ |
| Git commits | 78 (single author — 100% solo) |
| Development window | May 2026 – July 2026 |
| Platforms shipped | Web (Vercel) + native Android (signed APK/AAB, Play-Store-ready) |
| Campus locations mapped | 41 real MANIT locations (all 12 hostels, canteens, grounds, departments) |

> **Note for the writer:** Please do **not** invent user/traffic numbers. The project is production-deployed and
> publicly accessible, but I am not claiming a specific active-user count. Frame impact in terms of scope,
> engineering complexity and shipped surface area, not adoption metrics I can't defend in an interview.

---

## 3. Tech stack (exact versions — useful for keyword matching against JDs)

- **Frontend:** React 19, Vite 7, Tailwind CSS 3, React Router 7, Framer Motion, Axios, Leaflet / React-Leaflet, Lucide Icons
- **Backend:** Node.js, Express 5, Mongoose 9, Socket.IO 4, JSON Web Tokens, bcryptjs, Helmet, express-rate-limit, node-cron, Nodemailer, Multer
- **Database:** MongoDB (Atlas)
- **Real-time:** Socket.IO (bidirectional WebSockets — chat, read receipts, unread counts)
- **Media:** Cloudinary (image storage/CDN via Multer pipelines)
- **Push:** Firebase Cloud Messaging (web + Android), Firebase Admin SDK server-side
- **Mobile:** Capacitor 8 (Android) — App, Preferences, Status Bar, Splash Screen, Push Notifications, native HTTP
- **Payments:** UPI deep links (`upi://`) + server-generated payment QR codes (`qrcode`)
- **Infra / DevOps:** Vercel (web), Render (long-lived Node service for WebSockets), MongoDB Atlas, Gradle + JDK 21 for signed Android release builds
- **Tooling:** ESLint 9, PostCSS, Autoprefixer, clsx + tailwind-merge

---

## 4. Architecture — what a technical interviewer would actually care about

**Shape:** Monorepo with a decoupled SPA/native client and a REST + WebSocket API server.

- **Multi-tenant by design.** Every document in the database is scoped to a `University`. JWTs carry the
  tenant claim; an `auth()` → `universityScope()` middleware chain filters every read and write to
  `req.user.university`, and the Socket.IO layer independently re-checks tenancy before allowing a client to
  join a room or send a message. The architecture supports expanding to other NITs without a rewrite —
  MANIT is currently tenant #1, not a hardcoded assumption.
- **One file per endpoint.** The backend is organised into 23 feature folders (`auth`, `listings`,
  `documents`, `forum`, `offers`, `reports`, `rides`, `events`, …) with a single `.js` file per endpoint
  and shared logic in per-feature `helpers.js`. This was a deliberate choice for navigability and blast-radius
  control over the conventional fat-controller pattern.
- **Background jobs.** Three `node-cron` jobs run scheduled work independent of user traffic: class reminders
  (~30 min before each timetable entry), event reminders before RSVP'd events, and study-group session
  reminders. Each fans out to both in-app notifications and FCM push.
- **Real-time constraint drove an infra decision.** Socket.IO requires a persistent connection, which
  serverless platforms can't hold. The API is therefore deployed as a long-lived Node web service on Render
  while the static SPA is on Vercel — a documented, reasoned split rather than an accident.
- **Consistent API envelope.** Every response returns `{ success, message, data, meta }` through a shared
  response utility, with a centralised Express error handler.

---

## 5. Security engineering (the strongest differentiator — please give this real estate)

This is the part most student projects don't have. The system was hardened deliberately, defence-in-depth,
with no single control trusted alone:

- **Identity verification.** Only `@stu.manit.ac.in` scholar emails can register — enforced at the model
  layer *and* on every auth route. With SMTP configured, signup additionally requires a 6-digit email code
  that is stored **SHA-256-hashed** with a 30-minute expiry.
- **Token revocation without sacrificing UX.** JWTs embed a `tokenVersion` claim. A password reset increments
  it server-side, instantly invalidating every previously issued token. This delivers revoke-on-compromise
  while still allowing long-lived, friction-free sessions that survive app restarts.
- **Rate limiting.** `express-rate-limit` at 600 req/15 min per IP globally, tightened to 20 *failed*
  attempts/15 min on auth routes (successful logins deliberately not counted) — defeats brute force,
  signup spam and verification-code guessing.
- **Password reset.** Random token, only its SHA-256 hash persisted, 30-minute expiry, delivered via
  Nodemailer; the raw token is returned in the response **only** in development when no SMTP is configured.
- **Mass-assignment prevention.** Every write handler copies an explicit field whitelist, so
  `seller` / `university` / `isActive` can never be injected via the request body.
- **CORS.** Exact origin allow-list; preview deployments are matched on the **full project slug as a
  subdomain label**, closing the loose-substring hole where an attacker-registered `manithub-evil.vercel.app`
  would otherwise be trusted. Socket.IO shares the same policy.
- **Upload hardening.** Raster-only MIME allow-list — **SVG is explicitly rejected because it can carry
  XSS payloads** — plus size caps and per-listing image-count caps.
- **Privacy controls.** Private profiles are hidden from listings; phone numbers are exposed only to the
  owner and accepted friends, preventing scraping.
- **Production error hygiene.** 500-level errors return a generic message in production — no stack traces
  or internal detail leak to clients.
- **Passwords:** bcrypt, salted, cost factor 10, `select: false` on the schema, 8-character minimum.

**Three-layer content moderation pipeline:**
1. **Text filter** — a self-contained English + Hindi/Hinglish profanity filter I wrote, which de-obfuscates
   leetspeak, injected spacing and repeated characters, and uses whole-word matching to avoid false
   positives. Runtime-extensible via an `EXTRA_BLOCKED_WORDS` env var.
2. **Report → auto-hide → strikes → ban** — content auto-hides after N distinct reports (configurable);
   the author accrues a strike; N strikes auto-suspends the account, enforced at login, REST and socket
   layers. Admins retain a manual review queue that auto-resolves duplicate reports.
3. **Image moderation** — an env-gated hook (Google Cloud Vision SafeSearch or Sightengine) that rejects
   explicit imagery *before* it is stored. Deliberately **fails open** on provider outage so uploads aren't
   blocked by a third-party incident, with the report queue as the backstop.

A full "why / how / why-this-and-not-that" write-up of every control exists in the project's developer notes
document (Section 16 · Security hardening & content moderation).

---

## 6. Notable engineering problems solved (interview talking points)

- **Session durability across native app restarts.** Browser `localStorage` doesn't survive an Android app
  process being killed. Built a durable auth-storage layer using Capacitor Preferences (native key-value
  storage) with a `localStorage` mirror, so users stay signed in on both platforms until they explicitly log out.
- **Price negotiation state machine.** Buyers make offers; sellers accept / counter / decline / buyers
  withdraw — each transition fires notifications, and an accepted offer reserves the listing. This is real
  state-machine modelling, not CRUD.
- **Anonymous-but-accountable confessions.** Fully anonymous public feed with stable per-thread pseudonymous
  handles (`OP`, `Anon-XXXX`) so threaded replies stay coherent, while the underlying author reference stays
  private and remains attached for moderation/strike purposes. Anonymity and accountability at the same time.
- **Actionable academic tooling.** The CGPA tracker doesn't just compute SGPA/CGPA — it includes a
  target-CGPA "what-if" solver that tells you the SGPA required next semester. The attendance tracker answers
  the actual question students have ("can I skip the next class and stay above 75%?") rather than just
  displaying a percentage.
- **One codebase, two platforms.** Wrapped the SPA with Capacitor 8: offline-bundled fonts (no FOUT and no
  network dependency), theme-aware native status bar, native HTTP to bypass CORS entirely on device, and a
  signed release APK/AAB pipeline (Capacitor 8 requires JDK 21; keystore is git-ignored).
- **Gamification loop.** Karma points across uploads, answers, listings and contributions, milestone badges,
  and a campus leaderboard with per-user rank — designed to bootstrap the content supply side of a
  two-sided campus marketplace.
- **Design system.** MANIT navy/crimson/gold design tokens, full dark mode, a ⌘K command palette, and an
  8-item hub navigation grouped into Academics · Study · Marketplace · Campus Life — built to feel like a
  flagship consumer product rather than a college portal.

---

## 7. Full feature list (all shipped, not planned)

University-scoped auth with email verification · Student marketplace (6 categories, search/filter/sort,
wishlist, mark-sold) · Offers & negotiation · UPI checkout with auto-generated QR · Study groups
(branch-wise, member caps, scheduled sessions) · Study Vault (notes/PYQs/syllabi with in-app PDF & image
preview, upvotes, comments, download counts) · CGPA tracker with SGPA trend chart and target calculator ·
Attendance tracker with skip calculator · Personal timetable with automated class reminders · Anonymous
confessions with threaded anonymous replies · Lost & Found · Events & clubs with RSVP and reminders ·
Course Q&A forum with upvotes and accepted answers · Ride share with seat booking · Reports & admin
moderation queue · Gamification (karma, badges, leaderboard) · Rich profiles with reputation and
contribution history · Push notifications via FCM (web + Android) · Real-time chat with read receipts and
unread counts · Event-driven in-app notifications · Campus maps (41 real locations) · Settings (avatar,
UPI QR, notification prefs, privacy) · Dark mode + ⌘K command palette · Native Android app ·
Multi-tenant university isolation.

---

## 8. Draft resume bullets — please rewrite/tighten these freely

These are raw material, not final copy. Every claim is verifiable from the repo. Cut, merge and re-voice
as needed to fit the target format and page budget.

**Header line options:**
- *Manit Hub — Full-Stack Campus Super-App (React · Node · MongoDB · Capacitor) | Solo Developer | May–Jul 2026*
- *Manit Hub — Multi-Tenant Student Platform (MERN + Socket.IO + Android) | Sole Engineer*

**Bullets (pick 3–5):**
- Architected and shipped a production multi-tenant campus platform serving 20+ product modules —
  marketplace, study vault, CGPA/attendance trackers, real-time chat, anonymous confessions, ride-share and
  Q&A forum — as a single React 19 codebase deployed to both web (Vercel) and native Android (Capacitor 8,
  signed AAB).
- Designed and built a 111-endpoint REST API across 23 feature domains over 21 MongoDB collections
  (Express 5 · Mongoose 9), with JWT auth and middleware-enforced per-university data isolation applied to
  every read, write and WebSocket event.
- Hardened the platform defence-in-depth: `tokenVersion`-based instant JWT revocation on password reset,
  SHA-256-hashed email-verification and reset tokens, tiered rate limiting (600/15min global, 20 failed
  auth attempts/15min), explicit field whitelisting against mass assignment, and a slug-exact CORS
  allow-list closing a preview-domain spoofing vector.
- Engineered a three-layer content moderation pipeline: a custom English/Hinglish profanity filter that
  de-obfuscates leetspeak and character injection, a report → auto-hide → strike → auto-ban escalation
  system enforced at login/API/socket layers, and env-gated pre-storage image moderation (Cloud Vision /
  Sightengine) designed to fail open on provider outage.
- Implemented real-time messaging with Socket.IO (read receipts, unread counts, listing-scoped
  conversations) and three `node-cron` background jobs fanning out class, event and study-session reminders
  to in-app notifications and Firebase Cloud Messaging push on web and Android.
- Built a peer-to-peer commerce flow end-to-end: an accept/counter/decline offer state machine with
  listing reservation, Cloudinary image pipelines with MIME allow-listing (SVG rejected as an XSS vector),
  and two-tap UPI checkout via `upi://` deep links and server-generated payment QR codes.
- Solved native session durability by layering Capacitor Preferences over a localStorage mirror, keeping
  users authenticated across Android process death — and shipped a full design system with dark mode, a
  ⌘K command palette and MANIT-branded tokens across 26 route-level screens.

**Compressed one-line version (if space is tight):**
> **Manit Hub** — Solo-built multi-tenant campus super-app (React 19 · Express 5 · MongoDB · Socket.IO ·
> Capacitor Android): 111 REST endpoints, 21 collections, 20+ modules, real-time chat, FCM push, UPI
> checkout, and a defence-in-depth security + 3-layer moderation model. Live on Vercel/Render. *(~25.7k LOC)*

---

## 9. Guidance on tone & claims

- **Do lean on:** solo ownership, breadth of shipped scope, security depth, multi-tenancy, real-time
  systems, cross-platform delivery, and the reasoning behind infra choices. These are what separate this
  from a tutorial-grade MERN CRUD project.
- **Do not claim:** specific user counts, downloads, DAU, revenue, uptime percentages, or a team I led.
  It's a solo project that is live and public; that framing is already strong and is fully defensible in
  an interview.
- **Ambiguity to avoid:** "built for 5,000 students" reads as adoption. If campus scale must be mentioned,
  phrase it as *designed for* the MANIT student body, not *used by*.
- **Best interview hooks**, if the writer wants to leave threads for the interviewer to pull: the
  `tokenVersion` revocation design, the CORS slug-label fix, the fail-open image moderation decision, and
  the Render-vs-Vercel split forced by WebSocket persistence.

---

## 10. Links to include

- Live demo: https://manithub-samayjainbm.vercel.app/
- GitHub: https://github.com/Samay-Jain/Manit-Hub
- Video tour: https://youtu.be/4ngVWX2E0rU
