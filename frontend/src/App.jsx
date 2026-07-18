import { Suspense, lazy, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import AppLayout from "./layouts/AppLayout";
import { ToastProvider } from "./components/ui/ToastProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Dashboard = lazy(() => import("./screens/Dashboard"));
const Marketplace = lazy(() => import("./screens/Marketplace"));
const Messages = lazy(() => import("./screens/Messages"));
const StudyGroups = lazy(() => import("./screens/StudyGroups"));
const StudyVault = lazy(() => import("./screens/StudyVault"));
const CgpaCalculator = lazy(() => import("./screens/CgpaCalculator"));
const Attendance = lazy(() => import("./screens/Attendance"));
const LostFound = lazy(() => import("./screens/LostFound"));
const Confessions = lazy(() => import("./screens/Confessions"));
const Rides = lazy(() => import("./screens/Rides"));
const Timetable = lazy(() => import("./screens/Timetable"));
const Events = lazy(() => import("./screens/Events"));
const Forum = lazy(() => import("./screens/Forum"));
const QuestionDetail = lazy(() => import("./screens/QuestionDetail"));
const Offers = lazy(() => import("./screens/Offers"));
const AdminModeration = lazy(() => import("./screens/AdminModeration"));
const AdminDashboard = lazy(() => import("./screens/AdminDashboard"));
const AdminUsers = lazy(() => import("./screens/AdminUsers"));
const AdminUserDetail = lazy(() => import("./screens/AdminUserDetail"));
const Leaderboard = lazy(() => import("./screens/Leaderboard"));
const Friends = lazy(() => import("./screens/Friends"));
const StudyGroupDetails = lazy(() => import("./screens/StudyGroupDetails"));
const CampusMaps = lazy(() => import("./screens/CampusMaps"));
const Notifications = lazy(() => import("./screens/Notifications"));
const Settings = lazy(() => import("./screens/Settings"));
const Auth = lazy(() => import("./screens/Auth"));
const LandingPage = lazy(() => import("./screens/LandingPage"));
const NotFound = lazy(() => import("./screens/NotFound"));
const SellerProfile = lazy(() => import("./screens/SellerProfile"));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      Loading...
    </div>
  );
}

export default function App() {
  // Android hardware back button: go back in history, or exit at the root.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let handle;
    CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else CapacitorApp.exitApp();
    }).then((listener) => {
      handle = listener;
    });
    return () => handle?.remove();
  }, []);

  return (
    <ToastProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected app layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/study-groups" element={<StudyGroups />} />
              <Route path="/study-groups/:id" element={<StudyGroupDetails />} />
              <Route path="/study-vault" element={<StudyVault />} />
              <Route path="/cgpa" element={<CgpaCalculator />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/confessions" element={<Confessions />} />
              <Route path="/rides" element={<Rides />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/events" element={<Events />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:id" element={<QuestionDetail />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/campus-maps" element={<CampusMaps />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sellers/:id" element={<SellerProfile />} />
            </Route>
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}
