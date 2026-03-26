export type IconName =
  | "LayoutDashboard"
  | "FileText"
  | "Users"
  | "MessageSquare"
  | "BarChart3"
  | "Bell"
  | "UserCircle";

export type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Quản lý văn bản", href: "/admin/docs", icon: "FileText" },
  { label: "Cộng đồng", href: "/admin/community", icon: "MessageSquare" },
];

export const EMPLOYEE_NAV_ITEMS: NavItem[] = [
  { label: "Văn bản", href: "/employee/docs", icon: "FileText" },
  { label: "Cộng đồng", href: "/employee/community", icon: "MessageSquare" },
];

export const PUBLIC_ROUTES = ["/auth/login", "/auth/invite"];

export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  AMBASSADOR: "ambassador",
} as const;
