import { Home, ShoppingBag, Users, Map, MessageCircle, Bell } from "lucide-react";

export const navItems = [
  { name: "Dashboard", short: "Home", to: "/dashboard", icon: Home },
  { name: "Marketplace", short: "Market", to: "/marketplace", icon: ShoppingBag },
  { name: "Study Groups", short: "Groups", to: "/study-groups", icon: Users },
  { name: "Campus Maps", short: "Map", to: "/campus-maps", icon: Map },
  { name: "Messages", short: "Chats", to: "/messages", icon: MessageCircle },
  { name: "Notifications", short: "Alerts", to: "/notifications", icon: Bell },
];

export const bottomNavItems = [
  navItems[0],
  navItems[1],
  navItems[2],
  navItems[4],
  navItems[5],
];
