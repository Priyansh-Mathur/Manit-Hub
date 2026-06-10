import {
  Home,
  ShoppingBag,
  Users,
  Library,
  Map,
  MessageCircle,
  Bell,
  GraduationCap,
  CalendarCheck,
} from "lucide-react";

// Named items so insertions can't silently break bottomNavItems.
const dashboard = { name: "Dashboard", short: "Home", to: "/dashboard", icon: Home };
const marketplace = { name: "Marketplace", short: "Market", to: "/marketplace", icon: ShoppingBag };
const studyGroups = { name: "Study Groups", short: "Groups", to: "/study-groups", icon: Users };
const studyVault = { name: "Study Vault", short: "Docs", to: "/study-vault", icon: Library };
const cgpa = { name: "CGPA Tracker", short: "CGPA", to: "/cgpa", icon: GraduationCap };
const attendance = { name: "Attendance", short: "Attend", to: "/attendance", icon: CalendarCheck };
const campusMaps = { name: "Campus Maps", short: "Map", to: "/campus-maps", icon: Map };
const messages = { name: "Messages", short: "Chats", to: "/messages", icon: MessageCircle };
const notifications = { name: "Notifications", short: "Alerts", to: "/notifications", icon: Bell };

export const navItems = [
  dashboard,
  marketplace,
  studyGroups,
  studyVault,
  cgpa,
  attendance,
  campusMaps,
  messages,
  notifications,
];

export const bottomNavItems = [
  dashboard,
  marketplace,
  studyGroups,
  messages,
  notifications,
];
