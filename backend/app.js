const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

const app = express();

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

function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin / server-to-server / curl
  if (allowedOrigins.has(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith(".netlify.app") || hostname.endsWith(".vercel.app")) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
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
app.use("/api/auth", require("./auth/signup"));
app.use("/api/auth", require("./auth/login"));
app.use("/api/auth", require("./auth/forgotPassword"));
app.use("/api/auth", require("./auth/resetPassword"));

// Users
app.use("/api/users", require("./users/getMe"));
app.use("/api/users", require("./users/updateProfile"));
app.use("/api/users", require("./users/uploadAvatar"));
app.use("/api/users", require("./users/updatePaymentInfo"));
app.use("/api/users", require("./users/uploadPaymentQr"));
app.use("/api/users", require("./users/toggleSavedListing"));
app.use("/api/users", require("./users/getSettings"));
app.use("/api/users", require("./users/getSavedListings"));
app.use("/api/users", require("./users/searchUsers"));
app.use("/api/users", require("./users/checkHandle"));
app.use("/api/users", require("./users/deleteMe"));
app.use("/api/users", require("./users/getUserProfile"));
app.use("/api/users", require("./users/getFriendsOf"));
app.use("/api/users", require("./users/updateNotificationPreferences"));
app.use("/api/users", require("./users/updatePrivacySettings"));

// Universities
app.use("/api/universities", require("./universities/getUniversities"));

// Listings
app.use("/api/listings", require("./listings/getAllListings"));
app.use("/api/listings", require("./listings/getMyListings"));
app.use("/api/listings", require("./listings/getListingById"));
app.use("/api/listings", require("./listings/createListing"));
app.use("/api/listings", require("./listings/uploadListingImages"));
app.use("/api/listings", require("./listings/updateListingStatus"));
app.use("/api/listings", require("./listings/updateListing"));
app.use("/api/listings", require("./listings/deleteListing"));

// Conversations
app.use("/api/conversations", require("./conversations/getUserConversations"));
app.use("/api/conversations", require("./conversations/createConversation"));

// Messages
app.use("/api/messages", require("./messages/getMessages"));
app.use("/api/messages", require("./messages/sendMessage"));
app.use("/api/messages", require("./messages/markConversationRead"));

// Study groups
app.use("/api/study-groups", require("./studyGroups/getAllStudyGroups"));
app.use("/api/study-groups", require("./studyGroups/getUpcomingSessions"));
app.use("/api/study-groups", require("./studyGroups/getStudyGroupById"));
app.use("/api/study-groups", require("./studyGroups/createStudyGroup"));
app.use("/api/study-groups", require("./studyGroups/updateStudyGroup"));
app.use("/api/study-groups", require("./studyGroups/updateNextSession"));
app.use("/api/study-groups", require("./studyGroups/uploadGroupCover"));
app.use("/api/study-groups", require("./studyGroups/deleteStudyGroup"));
app.use("/api/study-groups", require("./studyGroups/joinStudyGroup"));
app.use("/api/study-groups", require("./studyGroups/leaveStudyGroup"));

// Notifications
app.use("/api/notifications", require("./notifications/getNotifications"));
app.use("/api/notifications", require("./notifications/markAsRead"));
app.use("/api/notifications", require("./notifications/markAllAsRead"));
app.use("/api/notifications", require("./notifications/deleteNotification"));

// Dashboard
app.use("/api/dashboard", require("./dashboard/getDashboardSummary"));

// Documents
app.use("/api/documents", require("./documents/getDocuments"));
app.use("/api/documents", require("./documents/getMyDocuments"));
app.use("/api/documents", require("./documents/createDocument"));
app.use("/api/documents", require("./documents/incrementDownload"));
app.use("/api/documents", require("./documents/toggleUpvote"));
app.use("/api/documents", require("./documents/addComment"));
app.use("/api/documents", require("./documents/deleteDocument"));

// Academic records
app.use("/api/academic-records", require("./academicRecords/getRecords"));
app.use("/api/academic-records", require("./academicRecords/upsertSemester"));
app.use("/api/academic-records", require("./academicRecords/deleteSemester"));

// Attendance
app.use("/api/attendance", require("./attendance/getSubjects"));
app.use("/api/attendance", require("./attendance/createSubject"));
app.use("/api/attendance", require("./attendance/updateSubject"));
app.use("/api/attendance", require("./attendance/deleteSubject"));

// Lost & found
app.use("/api/lost-found", require("./lostFound/getItems"));
app.use("/api/lost-found", require("./lostFound/createItem"));
app.use("/api/lost-found", require("./lostFound/updateStatus"));
app.use("/api/lost-found", require("./lostFound/deleteItem"));

// Confessions
app.use("/api/confessions", require("./confessions/getConfessions"));
app.use("/api/confessions", require("./confessions/createConfession"));
app.use("/api/confessions", require("./confessions/react"));
app.use("/api/confessions", require("./confessions/addComment"));
app.use("/api/confessions", require("./confessions/report"));
app.use("/api/confessions", require("./confessions/deleteConfession"));

// Rides
app.use("/api/rides", require("./rides/getRides"));
app.use("/api/rides", require("./rides/createRide"));
app.use("/api/rides", require("./rides/joinRide"));
app.use("/api/rides", require("./rides/leaveRide"));
app.use("/api/rides", require("./rides/deleteRide"));

// Timetable
app.use("/api/timetable", require("./timetable/getEntries"));
app.use("/api/timetable", require("./timetable/createEntry"));
app.use("/api/timetable", require("./timetable/updateEntry"));
app.use("/api/timetable", require("./timetable/deleteEntry"));

// Events
app.use("/api/events", require("./events/getEvents"));
app.use("/api/events", require("./events/createEvent"));
app.use("/api/events", require("./events/toggleRsvp"));
app.use("/api/events", require("./events/deleteEvent"));

// Forum
app.use("/api/forum", require("./forum/getQuestions"));
app.use("/api/forum", require("./forum/createQuestion"));
app.use("/api/forum", require("./forum/getQuestion"));
app.use("/api/forum", require("./forum/upvoteQuestion"));
app.use("/api/forum", require("./forum/addAnswer"));
app.use("/api/forum", require("./forum/deleteQuestion"));
app.use("/api/forum", require("./forum/upvoteAnswer"));
app.use("/api/forum", require("./forum/acceptAnswer"));
app.use("/api/forum", require("./forum/deleteAnswer"));

// Offers
app.use("/api/offers", require("./offers/getOffers"));
app.use("/api/offers", require("./offers/createOffer"));
app.use("/api/offers", require("./offers/updateOffer"));

// Reports
app.use("/api/reports", require("./reports/createReport"));
app.use("/api/reports", require("./reports/getReports"));
app.use("/api/reports", require("./reports/handleReport"));

// Leaderboard
app.use("/api/leaderboard", require("./leaderboard/getLeaderboard"));

// Push
app.use("/api/push", require("./push/registerToken"));
app.use("/api/push", require("./push/unregisterToken"));

// Friends
app.use("/api/friends", require("./friends/getFriends"));
app.use("/api/friends", require("./friends/getRequests"));
app.use("/api/friends", require("./friends/sendRequest"));
app.use("/api/friends", require("./friends/acceptRequest"));
app.use("/api/friends", require("./friends/removeRequest"));
app.use("/api/friends", require("./friends/unfriend"));

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
