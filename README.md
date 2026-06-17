<div align="center">

<img src="frontend/assets/icon.png" alt="Manit Hub" width="104" height="104" />

# Manit Hub

### The student super‑app for MANIT Bhopal — marketplace, study vault, CGPA & attendance trackers, confessions, events, ride‑share, Q&A, real‑time chat & campus maps, in one place.

Manit Hub brings campus life at **Maulana Azad National Institute of Technology (NIT Bhopal)** into a single, premium experience.
Built by students, for students — a verified, university‑scoped community on the **web** and as a native **Android** app.

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-bd8a1e.svg?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Samay-Jain/Manit-Hub?style=flat-square&color=1e4f92)](https://github.com/Samay-Jain/Manit-Hub/stargazers)
[![Forks](https://img.shields.io/github/forks/Samay-Jain/Manit-Hub?style=flat-square&color=1e4f92)](https://github.com/Samay-Jain/Manit-Hub/network/members)
[![Issues](https://img.shields.io/github/issues/Samay-Jain/Manit-Hub?style=flat-square&color=bb2735)](https://github.com/Samay-Jain/Manit-Hub/issues)
[![Last Commit](https://img.shields.io/github/last-commit/Samay-Jain/Manit-Hub?style=flat-square)](https://github.com/Samay-Jain/Manit-Hub/commits)

<br/>

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor_8-119EFF?style=flat-square&logo=capacitor&logoColor=white)

<br/>

[**🌐 Live Demo**](https://manithub-samayjainbm.netlify.app/) · [**▶️ Demo Link**](https://example.com/demo) · [**📱 Android App**](#-mobile-app-android) · [**🐛 Report Bug**](https://github.com/Samay-Jain/Manit-Hub/issues) · [**✨ Request Feature**](https://github.com/Samay-Jain/Manit-Hub/issues)

</div>

---

## 🎬 Demo

<div align="center">

<a href="https://example.com/demo">
  <img src="docs/screenshots/landing.png" alt="Manit Hub demo preview" width="680" />
</a>

<sub>▶️ Click to open the demo link</sub>

</div>

<div align="center">

| Landing | Login | Dashboard |
| :---: | :---: | :---: |
| ![Landing](docs/screenshots/landing.png) | ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |
| **CGPA Tracker** | **Attendance** | **Timetable** |
| ![CGPA Tracker](docs/screenshots/cgpa.png) | ![Attendance](docs/screenshots/attendance.png) | ![Timetable](docs/screenshots/timetable.png) |
| **Study Vault** | **Course Q&A** | **Study Groups** |
| ![Study Vault](docs/screenshots/study-vault.png) | ![Course Q&A](docs/screenshots/forum.png) | ![Study Groups](docs/screenshots/study-groups.png) |
| **Marketplace** | **Offers** | **Confessions** |
| ![Marketplace](docs/screenshots/marketplace.png) | ![Offers](docs/screenshots/offers.png) | ![Confessions](docs/screenshots/confessions.png) |
| **Events & Clubs** | **Lost & Found** | **Ride Share** |
| ![Events](docs/screenshots/events.png) | ![Lost & Found](docs/screenshots/lost-found.png) | ![Ride Share](docs/screenshots/rides.png) |
| **Campus Maps** | **Real-time Chat** | **Notifications** |
| ![Maps](docs/screenshots/campus-maps.png) | ![Chat](docs/screenshots/messages.png) | ![Notifications](docs/screenshots/notifications.png) |

</div>

**🔗 Live web app:** https://manithub-samayjainbm.netlify.app/
**🔌 API base URL:** `https://manit-hub.onrender.com/api`

<details>
<summary><b>Example API response</b> — <code>POST /api/auth/login</code></summary>

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": "6a0cb1909d5806fe5529ebaf",
      "displayName": "Samay Jain",
      "email": "2311401212@stu.manit.ac.in",
      "university": { "_id": "6a0cb190…", "name": "MANIT" }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
  }
}
```

</details>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [🏗️ Architecture](#️-architecture)
  - [System Overview](#system-overview)
  - [Folder Structure](#folder-structure)
  - [Request & Data Flow](#request--data-flow)
  - [Data Model](#data-model)
- [🚀 Getting Started](#-getting-started)
- [🔑 Environment Variables](#-environment-variables)
- [🌱 Seeding Demo Data](#-seeding-demo-data)
- [📱 Mobile App (Android)](#-mobile-app-android)
- [🔌 API Reference](#-api-reference)
- [☁️ Deployment](#️-deployment)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

| | Feature | What it does | Why it matters |
| :-- | :-- | :-- | :-- |
| 🔐 | **University‑scoped auth** | Sign up with your `@stu.manit.ac.in` email; JWT sessions with password reset. | A **verified, students‑only** community — every account is a real campus identity. |
| 🛒 | **Student Marketplace** | List, search, filter & sort items across 6 categories with condition badges, Cloudinary photos, wishlist and "mark sold". | Buy & sell textbooks, cycles and hostel gear **safely within campus** — settle over UPI. |
| 👥 | **Study Groups** | Create or join branch‑wise groups with tags, member caps, scheduled sessions and WhatsApp/Telegram/Discord/Meet links. | Find your people and **organise revision** without scattering across 5 apps. |
| 📚 | **Study Vault** | Upload, search & download notes, PYQs, syllabi and schedules — filtered by branch, subject, semester and type, with download counts, **in‑app PDF/image preview, upvotes & comments**. | The campus knowledge base: **exam prep material in one place** — and the best notes float to the top. |
| 🎓 | **CGPA Tracker** | Per‑semester subject/credit/grade entry with live SGPA & CGPA, an SGPA trend chart and a target‑CGPA "what‑if" calculator. | Know exactly **what SGPA you need next semester** — before the semester. |
| ✅ | **Attendance Tracker** | Mark present/absent per subject, see your %, and get the answer to "**can I skip the next class?**" against your ≥75% target. | Skip strategically, never fall below the **detained line**. |
| 🗓️ | **Personal Timetable** | Weekly class grid with rooms & professors, color‑coded by subject — plus **automatic reminders ~30 min before class** via cron. | Your schedule remembers itself. |
| 🤫 | **Confessions** | Fully anonymous campus feed with reactions, anonymous threaded replies (`OP` / `Anon-XXXX` handles), reporting and auto‑hide moderation. | Say it **without saying it was you** — with guardrails. |
| 🧭 | **Lost & Found** | Post lost/found items with photos, category & location; mark them returned; message the poster in chat. | Reunite lost ID cards, earbuds and keys **without 50 WhatsApp groups**. |
| 🎉 | **Events & Clubs** | Clubs publish events with venue & category; students RSVP and get a **reminder before it starts**. | The whole campus calendar, **one tap from RSVP**. |
| ❓ | **Course Q&A Forum** | StackOverflow‑style questions tagged by branch/subject/semester, with upvotes and **accepted answers**. | Doubts get answered **by people who took the same exam**. |
| 🚕 | **Ride Share** | Post a trip (from/to/time/seats), others book a seat and coordinate in chat; poster can cancel with notifications. | **Split cabs** to the station and airport painlessly. |
| 💸 | **UPI Checkout** | `upi://` deep link + auto‑generated QR from the seller's saved UPI ID, prefilled with the listing price. | Pay in two taps — **no payment handles in chat**. |
| 🤝 | **Offers & Negotiation** | Buyers make offers; sellers **accept / counter / decline** with notifications at every step; accepted offers reserve the listing. | Haggle like the campus market demands — **in the app, on the record**. |
| 🚩 | **Reports & Moderation** | Report any listing/doc/confession/question; admins get a review queue to **remove content or dismiss** (auto‑resolves duplicates). | User‑generated content **stays safe at scale**. |
| 🏆 | **Gamification** | Karma points for uploads, answers, listings & more; milestone badges and a campus **leaderboard**. | Contributing to campus **feels like winning**. |
| 👤 | **Rich Profiles** | Reputation (points, level, badges, verified mark) + contribution history across docs, Q&A, events and rides. | Your campus identity is **more than a username**. |
| 📲 | **Push Notifications (FCM)** | Every in‑app notification mirrors to **web & Android push** via Firebase Cloud Messaging (config‑gated). | Replies, offers and reminders reach you **even with the app closed**. |
| 💬 | **Real‑time Chat** | Socket.IO conversations tied to listings, with read receipts and unread counts. | Reach a seller or group‑mate **instantly**, with context attached. |
| 🔔 | **Event‑driven Notifications** | Auto‑generated on new message, group join, or interest in your listing — grouped & filterable. | Never miss a reply or a buyer — **the bell reflects real activity**. |
| 🗺️ | **Campus Maps** | 41 real MANIT locations — all 12 hostels, canteens, sports grounds and departments — opened in an embedded live map. | Navigate a sprawling campus by **name, category, or exact pin**. |
| ⚙️ | **Rich Settings** | Profile + avatar upload, UPI payment QR, notification preferences and privacy controls. | Control your identity, payments and visibility **from one place**. |
| 🎨 | **Premium Design System** | MANIT navy/crimson/gold tokens, full **dark mode**, a **⌘K command palette**, and a clean 8‑item **hub navigation** (Academics · Study · Marketplace · Campus Life) with in‑page tabs. | Feels like a flagship product, not a college portal. |
| 📱 | **Native Android App** | The same app shipped via **Capacitor** — offline‑bundled fonts, theme‑aware status bar, signed APK/AAB. | One codebase, **web + Play‑Store‑ready Android**. |
| 🏛️ | **Multi‑tenant by University** | Every listing, group and message is scoped to the user's university via middleware. | Clean **data isolation** — ready to expand beyond a single campus. |

---

## 🧰 Tech Stack

| Layer | Technologies |
| :-- | :-- |
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, Framer Motion, React Router 7, Axios, Lucide Icons, `@fontsource` |
| **Realtime** | Socket.IO (client + server) |
| **Backend** | Node.js, Express 5, Mongoose 9, JSON Web Tokens, bcryptjs, Helmet, CORS, node‑cron, Firebase Admin (FCM) |
| **Database** | MongoDB (Atlas) |
| **Media** | Cloudinary (via Multer) |
| **Push & QR** | Firebase Cloud Messaging (web + Android) · `qrcode` (UPI QR generation) |
| **Mobile** | Capacitor 8 (Android) — App, Status Bar, Splash Screen, native HTTP |
| **Tooling** | ESLint, PostCSS, Autoprefixer, clsx + tailwind‑merge |
| **Hosting** | Netlify (web) · Render (API) · MongoDB Atlas (DB) |

---

## 🏗️ Architecture

### System Overview

Manit Hub is a **monorepo** with a decoupled SPA/native client and a REST + WebSocket API. All data is **scoped per university** by JWT‑embedded claims, enforced by middleware.

```mermaid
graph TB
  subgraph Clients
    Web["🌐 Web App<br/>React + Vite · Netlify"]
    Android["📱 Android App<br/>Capacitor"]
  end

  subgraph Server["⚙️ API Server — Express · Render"]
    REST["REST API<br/>JWT + university scope"]
    WS["Socket.IO<br/>real-time chat"]
    Cron["node-cron<br/>class · event · session reminders"]
  end

  DB[("🍃 MongoDB Atlas<br/>Mongoose ODM")]
  Cloud["🖼️ Cloudinary<br/>image storage"]
  FCM["🔔 Firebase Cloud Messaging<br/>web + Android push"]

  Web -->|axios / HTTPS| REST
  Android -->|native HTTP| REST
  Web <-->|websocket| WS
  REST --> DB
  WS --> DB
  Cron --> DB
  REST -->|uploads| Cloud
  REST -->|push| FCM
  Cron -->|push| FCM
```

### Folder Structure

```
manit-hub/
├── frontend/                  # React + Vite SPA  (also the Capacitor Android shell)
│   ├── src/
│   │   ├── api/               # Axios clients (auth, listings, studyGroups, messages…)
│   │   ├── components/        # UI kit (ui/, brand/), nav, command palette, feature components
│   │   ├── context/           # Auth + Theme providers
│   │   ├── hooks/             # useAuth, useUnreadCount
│   │   ├── layouts/           # AppLayout (sidebar + topbar shell)
│   │   ├── lib/               # cn(), inline image fallbacks
│   │   ├── screens/           # Route-level screens (one per route)
│   │   └── utils/             # Socket.IO service
│   ├── android/               # Capacitor Android project (Gradle)
│   ├── scripts/               # App-icon generator
│   └── capacitor.config.json
│
├── backend/                   # Express REST + Socket.IO API — one .js file per endpoint
│   ├── app.js                 # Express app — mounts one router per endpoint
│   ├── server.js              # HTTP + Socket.IO bootstrap
│   ├── config/                # db (Mongo), cloudinary, firebase
│   ├── middleware/            # auth (JWT), universityScope, uploads, isAdmin, error handler
│   ├── models/                # User, Listing, StudyGroup, Document, Confession, Event, Ride, Question/Answer, Offer, Report, …
│   ├── utils/                 # jwt, response, gamification + shared notifications/universities helpers
│   ├── socket/                # chat.socket.js (real-time events)
│   ├── jobs/                  # studyGroup / class / event reminder cron jobs
│   ├── <feature>/             # 23 feature folders, one .js file per endpoint —
│   │                          #   auth · users · universities · listings · conversations ·
│   │                          #   messages · studyGroups · notifications · dashboard · documents ·
│   │                          #   academicRecords · attendance · lostFound · confessions · rides ·
│   │                          #   timetable · events · forum · offers · reports · leaderboard ·
│   │                          #   push · friends   (shared bits in <feature>/helpers.js)
│   └── scripts/seed.js        # Demo data seeder
│
└── README.md
```

### Request & Data Flow

A typical authenticated request — every read/write is filtered to the caller's university.

```mermaid
sequenceDiagram
  actor U as User
  participant C as Client (React/Android)
  participant A as API (Express)
  participant M as MongoDB

  U->>C: Sign in (email + password)
  C->>A: POST /api/auth/login
  A->>M: find user · verify bcrypt hash
  M-->>A: user + university
  A-->>C: { user, JWT }
  C->>C: persist token (localStorage)

  Note over C,A: All later calls send "Authorization: Bearer <JWT>"
  C->>A: GET /api/listings
  A->>A: auth() → universityScope()
  A->>M: query WHERE university = user.university
  M-->>A: scoped results
  A-->>C: { success, data, meta }
```

### Data Model

```mermaid
erDiagram
  UNIVERSITY ||--o{ USER : has
  UNIVERSITY ||--o{ LISTING : scopes
  UNIVERSITY ||--o{ STUDYGROUP : scopes
  UNIVERSITY ||--o{ DOCUMENT : scopes
  UNIVERSITY ||--o{ CONFESSION : scopes
  UNIVERSITY ||--o{ EVENT : scopes
  UNIVERSITY ||--o{ RIDE : scopes
  UNIVERSITY ||--o{ LOSTFOUNDITEM : scopes
  UNIVERSITY ||--o{ QUESTION : scopes
  USER ||--o{ LISTING : sells
  USER ||--o{ STUDYGROUP : creates
  USER ||--o{ DOCUMENT : uploads
  USER ||--o{ ACADEMICRECORD : "tracks grades"
  USER ||--o{ ATTENDANCESUBJECT : "tracks attendance"
  USER ||--o{ TIMETABLEENTRY : schedules
  USER ||--o{ CONFESSION : "posts (anonymously)"
  USER ||--o{ QUESTION : asks
  QUESTION ||--o{ ANSWER : has
  USER ||--o{ ANSWER : writes
  USER ||--o{ RIDE : posts
  RIDE }o--o{ USER : passengers
  USER ||--o{ EVENT : organizes
  EVENT }o--o{ USER : attendees
  USER ||--o{ LOSTFOUNDITEM : reports
  LISTING ||--o{ OFFER : receives
  USER ||--o{ OFFER : makes
  USER ||--o{ REPORT : files
  USER ||--o{ DEVICETOKEN : registers
  STUDYGROUP }o--o{ USER : members
  LISTING ||--o{ CONVERSATION : about
  USER ||--o{ CONVERSATION : participates
  CONVERSATION ||--o{ MESSAGE : contains
  USER ||--o{ NOTIFICATION : receives
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and npm
- A **MongoDB** connection string (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))
- *(optional)* a **Cloudinary** account for image uploads
- *(optional, for the Android app)* **Android Studio** + JDK 21

### 1. Clone

```bash
git clone https://github.com/Samay-Jain/Manit-Hub.git
cd Manit-Hub
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # then fill in MONGO_URI, JWT_SECRET, …
npm install
npm run seed                  # (optional) load demo data
npm run dev                   # starts the API on http://localhost:5001
```

### 3. Frontend

```bash
cd ../frontend
cp .env.example .env          # defaults work out of the box via the dev proxy
npm install
npm run dev                   # starts the web app on http://localhost:5173
```

Open **http://localhost:5173** and sign up with an `@stu.manit.ac.in` email. 🎉

> The Vite dev server proxies `/api` to the backend, so there are **no CORS headaches** locally.

---

## 🔑 Environment Variables

### `backend/.env`

| Variable | Required | Description |
| :-- | :--: | :-- |
| `MONGO_URI` | ✅ | MongoDB connection string (Atlas recommended) |
| `JWT_SECRET` | ✅ | Long random string used to sign JWTs |
| `CLIENT_URL` | ⬜ | Allowed CORS origin(s), comma‑separated (`*.netlify.app` / `*.vercel.app` & localhost are auto‑allowed) |
| `PORT` | ⬜ | API port (default `5001`) |
| `NODE_ENV` | ⬜ | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ⬜ | Needed for image/avatar uploads |
| `FIREBASE_SERVICE_ACCOUNT` | ⬜ | Firebase service-account JSON (raw or base64) — enables FCM push; in-app notifications work without it |

### `frontend/.env`

| Variable | Required | Description |
| :-- | :--: | :-- |
| `VITE_API_URL` | ⬜ | Explicit backend URL. Leave unset in dev to use the Vite proxy |
| `VITE_PROXY_TARGET` | ⬜ | Where the dev proxy forwards `/api` (defaults to the hosted backend) |
| `VITE_SOCKET_URL` | ⬜ | Socket.IO server URL |
| `VITE_FIREBASE_API_KEY` `…AUTH_DOMAIN` `…PROJECT_ID` `…SENDER_ID` `…APP_ID` `…VAPID_KEY` | ⬜ | Firebase web config — enables browser push; omit to disable |

---

## 🌱 Seeding Demo Data

Populate the marketplace, study groups, conversations and notifications with realistic MANIT‑themed data:

```bash
cd backend
npm run seed
```

Creates demo students (e.g. `aarav.demo@stu.manit.ac.in` / `password123`), 12 listings, 7 study groups, and private conversations + notifications for the configured primary user. Safe to re‑run — it resets only its own demo data.

---

## 📱 Mobile App (Android)

The web app is wrapped as a **native Android app** with [Capacitor](https://capacitorjs.com/). Native HTTP is enabled, so the app talks to the API with no extra CORS configuration.

```bash
cd frontend
npm run android          # build web → sync → open in Android Studio
npm run android:icons    # (re)generate launcher icons & splash from the MANIT crest
```

| Command | Action |
| :-- | :-- |
| `npm run cap:sync` | Rebuild the web app and copy it into the Android project |
| `npm run android` | Build, sync, and open Android Studio |
| `gradlew assembleDebug` | Build a debug APK → `android/app/build/outputs/apk/debug/` |
| `gradlew assembleRelease bundleRelease` | Build a **signed** APK + AAB for the Play Store |

> **Note:** Capacitor 8 requires **JDK 21** (Android Studio bundles it). Release signing reads from `android/keystore.properties` — keep your keystore safe and **never commit it** (it's git‑ignored).

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` and are scoped to the user's university.

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| `POST` | `/auth/signup` · `/auth/login` | Register / authenticate |
| `POST` | `/auth/forgot-password` · `/auth/reset-password` | Password recovery |
| `GET` `POST` `PUT` `DELETE` | `/listings` `…/:id` | Marketplace CRUD, status & images |
| `GET` `POST` | `/study-groups` `…/:id/join` `…/:id/leave` | Study groups CRUD & membership |
| `GET` `POST` `DELETE` | `/documents` `…/:id/download` `…/:id/upvote` `…/:id/comments` | Study Vault: upload, list/filter, downloads, **upvotes & comments**, delete own |
| `GET` `PUT` `DELETE` | `/academic-records` `…/:semester` | CGPA tracker: list & upsert per‑semester grades |
| `GET` `POST` `PATCH` `DELETE` | `/attendance` `…/:id` | Attendance: subjects, present/absent/undo actions, targets |
| `GET` `POST` `PUT` `DELETE` | `/timetable` `…/:id` | Weekly classes (cron sends reminders ~30 min before) |
| `GET` `POST` `DELETE` | `/confessions` `…/:id/react` `…/:id/comments` `…/:id/report` | Anonymous feed: post, react, reply, report |
| `GET` `POST` `PATCH` `DELETE` | `/lost-found` `…/:id/status` | Lost & Found board with photos and returned status |
| `GET` `POST` `DELETE` | `/rides` `…/:id/join` `…/:id/leave` | Ride share: post trips, book/release seats |
| `GET` `POST` `DELETE` | `/events` `…/:id/rsvp` | Events & clubs calendar with RSVP + reminders |
| `GET` `POST` `DELETE` | `/forum/questions` `…/:id/answers` `…/upvote` `…/accept` | Course Q&A: questions, answers, upvotes, accepted answers |
| `GET` `POST` `PATCH` | `/offers` `…/:id` | Price negotiation: make, accept, counter, decline, withdraw |
| `GET` `POST` `PATCH` | `/reports` `…/:id` | Report content; admin moderation queue (`isAdmin`) |
| `GET` | `/leaderboard` | Campus karma leaderboard + your rank |
| `POST` | `/push/register` `/push/unregister` | FCM device-token registry for push |
| `GET` `POST` | `/conversations` | Start / list conversations |
| `GET` `PUT` | `/messages/:conversationId` | Fetch & mark messages read *(send is via Socket.IO)* |
| `GET` `PUT` `DELETE` | `/notifications` | List, mark read, delete |
| `GET` `PUT` | `/users/me` · `/users/avatar` · `/users/settings` | Profile, avatar & settings |
| `GET` | `/dashboard/summary` | Dashboard aggregates |
| `GET` | `/health` | Health check |

**Realtime (Socket.IO):** `join_conversation`, `send_message`, `mark_read` → broadcasts `receive_message`, `messages_read`.

---

## ☁️ Deployment

| Component | Platform | Notes |
| :-- | :-- | :-- |
| **Web** | Netlify | `npm run build` → publish `frontend/dist` (SPA redirect to `/index.html`) |
| **API** | Render | Express + Socket.IO web service; set env vars in the dashboard |
| **Database** | MongoDB Atlas | Whitelist your hosts |
| **Android** | Google Play | Upload the signed `.aab` |

> ℹ️ **Live chat note:** Socket.IO needs a persistent (non‑serverless) host. The API runs on **Render** as a long‑lived Node web service, so real‑time chat works in production. (Serverless hosts like Vercel can't hold WebSocket connections.)

---

## 🗺️ Roadmap

- [x] Push notifications (FCM) — wired end‑to‑end, enable by adding Firebase keys
- [x] Lost & Found and Events modules
- [x] In‑app UPI deep links + QR for checkout
- [x] Admin moderation dashboard (`isAdmin` gate)
- [x] CGPA & attendance trackers, timetable with class reminders
- [x] Confessions, ride‑share, course Q&A, offers, gamification
- [ ] iOS build via Capacitor
- [ ] Expand multi‑tenant support to more NITs

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo & create a branch: `git checkout -b feat/amazing-thing`
2. Commit your changes: `git commit -m "feat: add amazing thing"`
3. Run `npm run lint` (frontend) and make sure the build passes
4. Push and open a Pull Request

Please keep PRs focused and describe the change clearly.

---

## 📄 License

Distributed under the **MIT License**. Add a [`LICENSE`](LICENSE) file at the repo root if one isn't present.

---

<div align="center">

**Manit Hub** — built by students, for students. 🎓
<br/>
<sub>Not an official institute portal. For official notices, visit <a href="https://www.manit.ac.in/">manit.ac.in</a>.</sub>

</div>
