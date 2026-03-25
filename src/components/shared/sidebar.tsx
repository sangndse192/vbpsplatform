"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { NavItem } from "@/lib/constants";

type SidebarProps = {
  navItems: NavItem[];
  theme: "indigo" | "blue";
  portalName: string;
};

function NavLinks({
  navItems,
  theme,
  pathname,
}: {
  navItems: NavItem[];
  theme: "indigo" | "blue";
  pathname: string;
}) {
  const activeClass =
    theme === "indigo"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-blue-100 text-blue-700";
  const hoverClass =
    theme === "indigo"
      ? "hover:bg-indigo-50 hover:text-indigo-700"
      : "hover:bg-blue-50 hover:text-blue-700";

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? activeClass : `text-gray-700 ${hoverClass}`
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

export function Sidebar({ navItems, theme, portalName }: SidebarProps) {
  const pathname = usePathname();
  const bgGradient =
    theme === "indigo"
      ? "from-indigo-600 to-indigo-700"
      : "from-blue-600 to-blue-700";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-white">
        <div
          className={cn(
            "flex h-14 items-center px-4 text-white font-bold bg-gradient-to-r",
            bgGradient
          )}
        >
          {portalName}
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks navItems={navItems} theme={theme} pathname={pathname} />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" size="icon" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <div
              className={cn(
                "flex h-14 items-center px-4 text-white font-bold bg-gradient-to-r",
                bgGradient
              )}
            >
              {portalName}
            </div>
            <div className="py-4">
              <NavLinks
                navItems={navItems}
                theme={theme}
                pathname={pathname}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
