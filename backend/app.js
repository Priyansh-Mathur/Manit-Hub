const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

const app = express();

// Render (and most hosts) sit behind one reverse proxy — needed so
// express-rate-limit sees the real client IP, not the proxy's.
app.set("trust proxy", 1);

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
// CORS — allow the configured client origin(s), local dev, and
// Netlify/Vercel deploy + preview subdomains.
const explicitOrigins = (
  process.env.CLIENT_URL || "https://manithub-samayjainbm.vercel.app"
)
  .split(",")
  // trim + strip trailing slashes — browser Origin headers never have one,
  // so a CLIENT_URL like "https://site.netlify.app/" would otherwise never match.
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const devOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  "https://localhost", // Capacitor Android (androidScheme: https)
  "capacitor://localhost", // Capacitor iOS / fallback
];

const allowedOrigins = new Set([...explicitOrigins, ...devOrigins]);

// Vercel/Netlify preview URLs for THIS project look like:
//   manithub-samayjainbm-<hash>-<team>.vercel.app
//   deploy-preview-12--manithub-samayjainbm.netlify.app
// so we match on the exact project slug as a subdomain prefix, not a loose
// substring. A plain `hostname.includes("manithub")` would let anyone register
// e.g. "manithub-evil.vercel.app" and pass — so we require the full slug.
const PROJECT_SLUGS = (process.env.DEPLOY_SLUGS || "manithub-samayjainbm")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isProjectPreviewHost(hostname) {
  const host = hostname.toLowerCase();
  const isPreviewPlatform =
    host.endsWith(".vercel.app") || host.endsWith(".netlify.app");
  if (!isPreviewPlatform) return false;
  // The leftmost DNS label (before the platform domain) must start with,
  // end with, or exactly equal one of our project slugs.
  const label = host.split(".")[0];
  return PROJECT_SLUGS.some(
    (slug) =>
      label === slug ||
      label.startsWith(`${slug}-`) ||
      label.endsWith(`--${slug}`)
  );
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin / server-to-server / curl
  if (allowedOrigins.has(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return isProjectPreviewHost(hostname);
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate limiting — a broad per-IP cap on the whole API, plus a much stricter
// cap on the auth endpoints (login brute force, signup spam, reset-token
// guessing). standardHeaders lets clients see their remaining quota.
//
// NOTE: the default store is in-memory, which is correct for the single Render
// instance we run today. If this is ever scaled to multiple instances, the
// counters won't be shared — swap in a shared store (e.g. rate-limit-redis)
// so the limits hold across the fleet.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Don't count successful logins/signups against the cap — only failures
  // (wrong password, invalid token…), which is what brute force looks like.
  skipSuccessfulRequests: true,
  message: { message: "Too many attempts, please try again in 15 minutes" },
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes — one router file per endpoint, mounted at the feature base path.
// Order within a feature mirrors the original routes file (static paths before
// :param paths so e.g. /me and /upcoming are not shadowed by /:id).

// Auth
app.use("/api/auth", require("./apis/auth/signup"));
app.use("/api/auth", require("./apis/auth/login"));
app.use("/api/auth", require("./apis/auth/adminLogin"));
app.use("/api/auth", require("./apis/auth/forgotPassword"));
app.use("/api/auth", require("./apis/auth/resetPassword"));
app.use("/api/auth", require("./apis/auth/verifyEmail"));
app.use("/api/auth", require("./apis/auth/resendVerification"));

// Users
app.use("/api/users", require("./apis/users/getMe"));
app.use("/api/users", require("./apis/users/updateProfile"));
app.use("/api/users", require("./apis/users/uploadAvatar"));
app.use("/api/users", require("./apis/users/updatePaymentInfo"));
app.use("/api/users", require("./apis/users/uploadPaymentQr"));
app.use("/api/users", require("./apis/users/toggleSavedListing"));
app.use("/api/users", require("./apis/users/getSettings"));
app.use("/api/users", require("./apis/users/getSavedListings"));
app.use("/api/users", require("./apis/users/searchUsers"));
app.use("/api/users", require("./apis/users/checkHandle"));
app.use("/api/users", require("./apis/users/deleteMe"));
app.use("/api/users", require("./apis/users/getUserProfile"));
app.use("/api/users", require("./apis/users/getFriendsOf"));
app.use("/api/users", require("./apis/users/updateNotificationPreferences"));
app.use("/api/users", require("./apis/users/updatePrivacySettings"));

// Universities
app.use("/api/universities", require("./apis/universities/getUniversities"));

// Listings
app.use("/api/listings", require("./apis/listings/getAllListings"));
app.use("/api/listings", require("./apis/listings/getMyListings"));
app.use("/api/listings", require("./apis/listings/getListingById"));
app.use("/api/listings", require("./apis/listings/createListing"));
app.use("/api/listings", require("./apis/listings/uploadListingImages"));
app.use("/api/listings", require("./apis/listings/updateListingStatus"));
app.use("/api/listings", require("./apis/listings/updateListing"));
app.use("/api/listings", require("./apis/listings/deleteListing"));

// Conversations
app.use("/api/conversations", require("./apis/conversations/getUserConversations"));
app.use("/api/conversations", require("./apis/conversations/createConversation"));

// Messages
app.use("/api/messages", require("./apis/messages/getMessages"));
app.use("/api/messages", require("./apis/messages/sendMessage"));
app.use("/api/messages", require("./apis/messages/markConversationRead"));

// Study groups
app.use("/api/study-groups", require("./apis/studyGroups/getAllStudyGroups"));
app.use("/api/study-groups", require("./apis/studyGroups/getUpcomingSessions"));
app.use("/api/study-groups", require("./apis/studyGroups/getStudyGroupById"));
app.use("/api/study-groups", require("./apis/studyGroups/createStudyGroup"));
app.use("/api/study-groups", require("./apis/studyGroups/updateStudyGroup"));
app.use("/api/study-groups", require("./apis/studyGroups/updateNextSession"));
app.use("/api/study-groups", require("./apis/studyGroups/uploadGroupCover"));
app.use("/api/study-groups", require("./apis/studyGroups/deleteStudyGroup"));
app.use("/api/study-groups", require("./apis/studyGroups/joinStudyGroup"));
app.use("/api/study-groups", require("./apis/studyGroups/leaveStudyGroup"));

// Notifications
app.use("/api/notifications", require("./apis/notifications/getNotifications"));
app.use("/api/notifications", require("./apis/notifications/markAsRead"));
app.use("/api/notifications", require("./apis/notifications/markAllAsRead"));
app.use("/api/notifications", require("./apis/notifications/deleteNotification"));

// Dashboard
app.use("/api/dashboard", require("./apis/dashboard/getDashboardSummary"));

// Documents
app.use("/api/documents", require("./apis/documents/getDocuments"));
app.use("/api/documents", require("./apis/documents/getMyDocuments"));
app.use("/api/documents", require("./apis/documents/createDocument"));
app.use("/api/documents", require("./apis/documents/incrementDownload"));
app.use("/api/documents", require("./apis/documents/toggleUpvote"));
app.use("/api/documents", require("./apis/documents/addComment"));
app.use("/api/documents", require("./apis/documents/deleteDocument"));

// Academic records
app.use("/api/academic-records", require("./apis/academicRecords/getRecords"));
app.use("/api/academic-records", require("./apis/academicRecords/upsertSemester"));
app.use("/api/academic-records", require("./apis/academicRecords/deleteSemester"));

// Attendance
app.use("/api/attendance", require("./apis/attendance/getSubjects"));
app.use("/api/attendance", require("./apis/attendance/createSubject"));
app.use("/api/attendance", require("./apis/attendance/updateSubject"));
app.use("/api/attendance", require("./apis/attendance/deleteSubject"));

// Lost & found
app.use("/api/lost-found", require("./apis/lostFound/getItems"));
app.use("/api/lost-found", require("./apis/lostFound/createItem"));
app.use("/api/lost-found", require("./apis/lostFound/updateStatus"));
app.use("/api/lost-found", require("./apis/lostFound/deleteItem"));

// Confessions
app.use("/api/confessions", require("./apis/confessions/getConfessions"));
app.use("/api/confessions", require("./apis/confessions/createConfession"));
app.use("/api/confessions", require("./apis/confessions/react"));
app.use("/api/confessions", require("./apis/confessions/addComment"));
app.use("/api/confessions", require("./apis/confessions/report"));
app.use("/api/confessions", require("./apis/confessions/deleteConfession"));

// Rides
app.use("/api/rides", require("./apis/rides/getRides"));
app.use("/api/rides", require("./apis/rides/createRide"));
app.use("/api/rides", require("./apis/rides/joinRide"));
app.use("/api/rides", require("./apis/rides/leaveRide"));
app.use("/api/rides", require("./apis/rides/deleteRide"));

// Timetable
app.use("/api/timetable", require("./apis/timetable/getEntries"));
app.use("/api/timetable", require("./apis/timetable/createEntry"));
app.use("/api/timetable", require("./apis/timetable/updateEntry"));
app.use("/api/timetable", require("./apis/timetable/deleteEntry"));

// Events
app.use("/api/events", require("./apis/events/getEvents"));
app.use("/api/events", require("./apis/events/createEvent"));
app.use("/api/events", require("./apis/events/toggleRsvp"));
app.use("/api/events", require("./apis/events/deleteEvent"));

// Forum
app.use("/api/forum", require("./apis/forum/getQuestions"));
app.use("/api/forum", require("./apis/forum/createQuestion"));
app.use("/api/forum", require("./apis/forum/getQuestion"));
app.use("/api/forum", require("./apis/forum/upvoteQuestion"));
app.use("/api/forum", require("./apis/forum/addAnswer"));
app.use("/api/forum", require("./apis/forum/deleteQuestion"));
app.use("/api/forum", require("./apis/forum/upvoteAnswer"));
app.use("/api/forum", require("./apis/forum/acceptAnswer"));
app.use("/api/forum", require("./apis/forum/deleteAnswer"));

// Offers
app.use("/api/offers", require("./apis/offers/getOffers"));
app.use("/api/offers", require("./apis/offers/createOffer"));
app.use("/api/offers", require("./apis/offers/updateOffer"));

// Reports
app.use("/api/reports", require("./apis/reports/createReport"));
app.use("/api/reports", require("./apis/reports/getReports"));
app.use("/api/reports", require("./apis/reports/handleReport"));

// Admin / CEO console — analytics + account management (auth + isAdmin gated).
// Specific /users action routes before the generic /users/:id detail route.
app.use("/api/admin", require("./apis/admin/getOverview"));
app.use("/api/admin", require("./apis/admin/getGrowth"));
app.use("/api/admin", require("./apis/admin/getBreakdown"));
app.use("/api/admin", require("./apis/admin/suspendUser"));
app.use("/api/admin", require("./apis/admin/unsuspendUser"));
app.use("/api/admin", require("./apis/admin/getUsers"));
app.use("/api/admin", require("./apis/admin/getUserDetail"));

// Leaderboard
app.use("/api/leaderboard", require("./apis/leaderboard/getLeaderboard"));

// Push
app.use("/api/push", require("./apis/push/registerToken"));
app.use("/api/push", require("./apis/push/unregisterToken"));

// Friends
app.use("/api/friends", require("./apis/friends/getFriends"));
app.use("/api/friends", require("./apis/friends/getRequests"));
app.use("/api/friends", require("./apis/friends/sendRequest"));
app.use("/api/friends", require("./apis/friends/acceptRequest"));
app.use("/api/friends", require("./apis/friends/removeRequest"));
app.use("/api/friends", require("./apis/friends/unfriend"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Root route for deployments (removes `Cannot GET /` on hosting platforms)
app.get('/', (req, res) => {
  res.send('MANIT HUB API is running');
});

// Global error handler (LAST)
app.use(errorHandler);

module.exports = app;
// Shared with server.js so Socket.IO enforces the same origin policy.
module.exports.isAllowedOrigin = isAllowedOrigin;
