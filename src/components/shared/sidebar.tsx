"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  FileImage,
  Users,
  BarChart3,
  BookOpen,
  Bell,
  ArchiveRestore,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/ads", label: "Ad Queue", icon: FileImage },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/backups", label: "Backups", icon: ArchiveRestore },
];

const organizerNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "My Events", icon: CalendarDays },
];

interface SidebarProps {
  role: "admin" | "organizer";
  orgName?: string;
}

export function Sidebar({ role, orgName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : organizerNav;

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r bg-card">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <BookOpen className="h-6 w-6 text-primary" />
        <div>
          <p className="font-bold text-sm">BookletFlow</p>
          {orgName && <p className="text-xs text-muted-foreground truncate max-w-[140px]">{orgName}</p>}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
