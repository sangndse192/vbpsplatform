"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Bell,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { NavItem, IconName } from "@/lib/constants";

const ICON_MAP: Record<IconName, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Bell,
  UserCircle,
};

type SidebarProps = {
  navItems: NavItem[];
  role: "admin" | "employee";
  userProfile?: { name: string; branch?: string; isAmbassador?: boolean };
  switchUrl?: string;
  switchLabel?: string;
};

function NavLinks({
  navItems,
  pathname,
}: {
  navItems: NavItem[];
  pathname: string;
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = ICON_MAP[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-colors",
              isActive
                ? "bg-indigo-50 text-indigo-600 font-bold"
                : "text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarHeader({ role }: { role: "admin" | "employee" }) {
  return (
    <div className="flex h-14 items-center gap-3 px-4 border-b border-slate-200">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm shrink-0">
        VBSP
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-extrabold text-slate-800">VBSP Platform</span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {role === "admin" ? "ADMIN" : "NHÂN VIÊN"}
        </span>
      </div>
    </div>
  );
}

function UserProfileSection({
  userProfile,
}: {
  userProfile: { name: string; branch?: string; isAmbassador?: boolean };
}) {
  const initials = userProfile.name
    ? userProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NV";

  return (
    <div className="px-4 py-3 border-b">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {userProfile.name || "Nhân viên"}
          </span>
          {userProfile.branch && (
            <span className="text-xs text-gray-500 truncate">
              {userProfile.branch}
            </span>
          )}
        </div>
      </div>
      {userProfile.isAmbassador && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">
            ⭐ Đại sứ nghiệp vụ
          </span>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  navItems,
  role,
  userProfile,
  switchUrl,
  switchLabel,
  pathname,
}: SidebarProps & { pathname: string }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <SidebarHeader role={role} />

      {role === "employee" && userProfile && (
        <UserProfileSection userProfile={userProfile} />
      )}

      <div className="flex-1 overflow-y-auto py-3">
        <NavLinks navItems={navItems} pathname={pathname} />
      </div>

      {switchUrl && switchLabel && (
        <div className="border-t border-slate-200 px-4 py-3">
          <Link
            href={switchUrl}
            className="flex items-center justify-center gap-2 rounded-[10px] bg-indigo-50 border border-indigo-200 px-3 py-2.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors w-full text-center"
          >
            <span>→</span>
            <span>{switchLabel}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  navItems,
  role,
  userProfile,
  switchUrl,
  switchLabel,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-slate-200 md:flex-shrink-0">
        <SidebarContent
          navItems={navItems}
          role={role}
          userProfile={userProfile}
          switchUrl={switchUrl}
          switchLabel={switchLabel}
          pathname={pathname}
        />
      </aside>

      {/* Mobile hamburger + sheet */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="icon" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SidebarContent
              navItems={navItems}
              role={role}
              userProfile={userProfile}
              switchUrl={switchUrl}
              switchLabel={switchLabel}
              pathname={pathname}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
