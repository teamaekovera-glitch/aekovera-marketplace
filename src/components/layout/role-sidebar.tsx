"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/lib/types";

/**
 * Shared sidebar navigation shell (F-15). Nav items render per role
 * (brand / buyer / admin); admin gets an "all areas" section.
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BRAND_NAV: NavItem[] = [
  { href: "/brand", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brand/profile", label: "Brand profile", icon: Building2 },
  { href: "/brand/products", label: "Products", icon: Package },
  { href: "/brand/opportunities", label: "Opportunities", icon: Search },
  { href: "/brand/submissions", label: "Submissions", icon: ClipboardList },
  { href: "/brand/messages", label: "Messages", icon: MessageSquare },
  { href: "/brand/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/brand/settings", label: "Settings", icon: Settings },
];

const BUYER_NAV: NavItem[] = [
  { href: "/buyer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buyer/discover", label: "Discover", icon: Search },
  { href: "/buyer/opportunities", label: "Sourcing", icon: ClipboardList },
  { href: "/buyer/saved", label: "Saved brands", icon: Building2 },
  { href: "/buyer/messages", label: "Messages", icon: MessageSquare },
  { href: "/buyer/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/buyers", label: "Buyer verification", icon: Users },
  { href: "/admin/taxonomy", label: "Taxonomy", icon: Package },
  { href: "/admin/analytics", label: "Platform analytics", icon: BarChart3 },
];

const AREA_HOME: Record<UserRole, string> = {
  brand: "/brand",
  buyer: "/buyer",
  admin: "/admin",
};

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="px-3 py-2">
      <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <nav aria-label={title}>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${item.href.split("/")[1]}` &&
                pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function RoleSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items =
    role === "brand" ? BRAND_NAV : role === "buyer" ? BUYER_NAV : ADMIN_NAV;

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Aekovera
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <NavSection title={role === "admin" ? "Platform" : role === "brand" ? "Brand" : "Buyer"} items={items} pathname={pathname} />
        {role === "admin" && (
          <NavSection
            title="Jump to area"
            items={[
              { href: AREA_HOME.brand, label: "Brand portal", icon: Building2 },
              { href: AREA_HOME.buyer, label: "Buyer portal", icon: Users },
            ]}
            pathname={pathname}
          />
        )}
      </div>
      <div className="border-t px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          {role === "admin" ? "Platform admin" : `${role} workspace`}
        </p>
      </div>
    </aside>
  );
}
