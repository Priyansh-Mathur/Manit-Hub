# Manit Hub – Backend

Backend service for **Manit Hub**, a student-focused platform with:

- Marketplace (listings, wishlist, status)
- Study Groups (join/leave, sessions, reminders)
- Real-time messaging + notifications
- JWT-based authentication

Built with **Node.js, Express, MongoDB, and Socket.io**.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (real-time chat)
- Helmet & CORS (security)
- Cloudinary (image uploads)

---

## Project Structure

The API follows a **one-file-per-endpoint** layout: every route lives in its own
`.js` file (an `express.Router()` with the handler inline) grouped by feature, and
`app.js` mounts each at its base path. No `controllers/` + `routes/` split.

```bash
backend/
├── server.js                  # HTTP server + Socket.IO bootstrap
├── app.js                     # Express app — mounts one router per endpoint
│
├── config/                    # db (Mongo), cloudinary, firebase
├── models/                    # Mongoose schemas: User, University, Listing, StudyGroup,
│                              #   Conversation, Message, Notification, Document, …
├── middleware/                # auth, universityScope, isAdmin, upload*, error
├── socket/                    # chat.socket.js (real-time events)
├── jobs/                      # studyGroupReminder · classReminder · eventReminder (cron)
├── utils/                     # jwt, response, gamification, handle, push,
│                              #   notifications + universities (shared helpers)
│
│   # One .js file per endpoint, grouped by feature (router + handler inline):
├── auth/                      # signup · login · forgotPassword · resetPassword
├── users/                     # getMe · updateProfile · uploadAvatar · searchUsers · … (15)
├── listings/                  # getAllListings · getListingById · createListing · … (8)
├── studyGroups/               # getAllStudyGroups · createStudyGroup · join · leave · … (10)
├── messages/   conversations/   notifications/   dashboard/
├── documents/   academicRecords/   attendance/   lostFound/   confessions/
├── rides/   timetable/   events/   forum/   offers/   reports/
├── leaderboard/   push/   friends/   universities/
│                              #   (feature-local shared code lives in <feature>/helpers.js)
│
├── scripts/seed.js            # Demo data seeder
├── .env
├── package.json
└── README.md
```

---

## Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/manit-hub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# Optional
CAMPUS_LOCATIONS_COUNT=10
```

For Render production, set the same values in the service's environment variables (Render dashboard), especially `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL=https://manithub-samayjainbm.vercel.app`.

### 3. Run the Server

```bash
npm run dev
```

Server runs at `http://localhost:5001`.

Health check: `GET /api/health`

---

## Authentication

Protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

JWT is returned on **signup** and **login**.

---

## Key Endpoints (high level)

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- Listings: `GET /api/listings`, `POST /api/listings`, `PUT /api/listings/:id`, `PATCH /api/listings/:id/status`, `POST /api/listings/:id/images`, `DELETE /api/listings/:id`
- Study Groups: `GET /api/study-groups`, `GET /api/study-groups/upcoming`, `POST /api/study-groups`, `PUT /api/study-groups/:id`, `PUT /api/study-groups/:id/next-session`, `POST /api/study-groups/:id/cover`, `POST /api/study-groups/:id/join`, `POST /api/study-groups/:id/leave`, `DELETE /api/study-groups/:id`
- Notifications: `GET /api/notifications`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`
- Dashboard: `GET /api/dashboard/summary`
- Users: `GET /api/users/me`, `GET /api/users/settings`, `PUT /api/users/payment-info`, `PUT /api/users/payment-qr`, `POST /api/users/saved-listings/:listingId`, `DELETE /api/users/me`

## Jobs

Cron jobs run every 10 minutes and create in-app notifications (mirrored to push):

- `studyGroupReminder.job.js` — upcoming study-group sessions
- `classReminder.job.js` — classes starting soon (from each user's timetable)
- `eventReminder.job.js` — events about to start

---
