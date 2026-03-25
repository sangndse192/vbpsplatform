import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Bell,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/admin/docs", icon: FileText },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Community", href: "/admin/community", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export const EMPLOYEE_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/employee/docs", icon: FileText },
  { label: "Community", href: "/employee/community", icon: MessageSquare },
  { label: "Notifications", href: "/employee/notifications", icon: Bell },
  { label: "Profile", href: "/employee/profile", icon: UserCircle },
];

export const PUBLIC_ROUTES = ["/auth/login", "/auth/invite"];

export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  AMBASSADOR: "ambassador",
} as const;
