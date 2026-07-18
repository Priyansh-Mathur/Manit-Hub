import {
  Home,
  ShoppingBag,
  Library,
  Map,
  MessageCircle,
  Bell,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  UserPlus,
  LayoutDashboard,
  Users,
} from "lucide-react";

/**
 * Tabbed hub groups — one sidebar entry per hub, sibling pages switch via
 * the HubTabs strip rendered at the top of each grouped page.
 */
export const hubs = {
  academics: {
    label: "Academics",
    tabs: [
      { label: "CGPA", to: "/cgpa" },
      { label: "Attendance", to: "/attendance" },
      { label: "Timetable", to: "/timetable" },
    ],
  },
  study: {
    label: "Study",
    tabs: [
      { label: "Vault", to: "/study-vault" },
      { label: "Q&A", to: "/forum" },
      { label: "Groups", to: "/study-groups" },
    ],
  },
  market: {
    label: "Marketplace",
    tabs: [
      { label: "Listings", to: "/marketplace" },
      { label: "Offers", to: "/offers" },
    ],
  },
  campus: {
    label: "Campus Life",
    tabs: [
      { label: "Confessions", to: "/confessions" },
      { label: "Events", to: "/events" },
      { label: "Lost & Found", to: "/lost-found" },
      { label: "Rides", to: "/rides" },
      { label: "Leaderboard", to: "/leaderboard" },
    ],
  },
};

const hubPaths = (key) => hubs[key].tabs.map((tab) => tab.to);

// Named items so insertions can't silently break bottomNavItems.
const dashboard = { name: "Dashboard", short: "Home", to: "/dashboard", icon: Home };
const academics = {
  name: "Academics",
  short: "Acads",
  to: "/cgpa",
  icon: GraduationCap,
  match: hubPaths("academics"),
};
const study = {
  name: "Study",
  short: "Study",
  to: "/study-vault",
  icon: Library,
  match: hubPaths("study"),
};
const market = {
  name: "Marketplace",
  short: "Market",
  to: "/marketplace",
  icon: ShoppingBag,
  match: hubPaths("market"),
};
const campus = {
  name: "Campus Life",
  short: "Campus",
  to: "/confessions",
  icon: Sparkles,
  match: hubPaths("campus"),
};
const friends = { name: "Friends", short: "Friends", to: "/friends", icon: UserPlus };
const campusMaps = { name: "Campus Maps", short: "Map", to: "/campus-maps", icon: Map };
const messages = { name: "Messages", short: "Chats", to: "/messages", icon: MessageCircle };
const notifications = { name: "Notifications", short: "Alerts", to: "/notifications", icon: Bell };

export const navItems = [
  dashboard,
  academics,
  study,
  market,
  campus,
  friends,
  campusMaps,
  messages,
  notifications,
];

// Rendered only for users with isAdmin (see SideNav / MobileDrawer).
export const adminNavItems = [
  {
    name: "Admin Overview",
    short: "Admin",
    to: "/admin",
    icon: LayoutDashboard,
    // Exact match so it isn't highlighted on /admin/users, /admin/moderation…
    end: true,
  },
  { name: "Accounts", short: "Users", to: "/admin/users", icon: Users },
  { name: "Moderation", short: "Mod", to: "/admin/moderation", icon: ShieldCheck },
];

export const bottomNavItems = [
  dashboard,
  market,
  study,
  messages,
  notifications,
];
