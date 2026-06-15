const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const universitiesRoutes = require("./routes/universities.routes");
const listingsRoutes = require("./routes/listings.routes");
const conversationsRoutes = require("./routes/conversations.routes");
const messagesRoutes = require("./routes/messages.routes");
const studyGroupsRoutes = require("./routes/studyGroups.routes");
const usersRoutes = require("./routes/users.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const documentsRoutes = require("./routes/documents.routes");
const academicRecordsRoutes = require("./routes/academicRecords.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const lostFoundRoutes = require("./routes/lostFound.routes");
const confessionsRoutes = require("./routes/confessions.routes");
const ridesRoutes = require("./routes/rides.routes");
const timetableRoutes = require("./routes/timetable.routes");
const eventsRoutes = require("./routes/events.routes");
const forumRoutes = require("./routes/forum.routes");
const offersRoutes = require("./routes/offers.routes");
const reportsRoutes = require("./routes/reports.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const pushRoutes = require("./routes/push.routes");
const friendsRoutes = require("./routes/friends.routes");

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
  process.env.CLIENT_URL || "https://manithub-samayjainbm.netlify.app"
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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/universities", universitiesRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/study-groups", studyGroupsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/academic-records", academicRecordsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/confessions", confessionsRoutes);
app.use("/api/rides", ridesRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/friends", friendsRoutes);

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
