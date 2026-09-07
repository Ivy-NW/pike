"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { clearToken } from "@/lib/auth";
import {
  ChartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  GearIcon,
  GiftIcon,
  GridIcon,
  PlusIcon,
  SignOutIcon,
} from "./icons";

const links = [
  { href: "/home", label: "Dashboard", icon: GridIcon },
  { href: "/quests", label: "Quests", icon: CompassIcon },
  { href: "/rewards", label: "Rewards", icon: GiftIcon },
  { href: "/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
];

const COLLAPSE_KEY = "pike-dashboard-sidebar-collapsed";

export function Sidebar({ businessName }: { businessName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <>
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-brand">
        <Logo size={26} />
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-label">Business Portal</div>
        </div>
        <div className="sidebar-brand-actions">
          <button
            type="button"
            className="sidebar-collapse-toggle"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRightIcon size={14} /> : <ChevronLeftIcon size={14} />}
          </button>
        </div>
      </div>

      <Link href="/quests/new" className="icon sidebar-create" title="Create quest">
        <PlusIcon size={16} />
        <span>Create quest</span>
      </Link>

      <nav className="sidebar-nav" aria-label="Business portal">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={`sidebar-link${active ? " active" : ""}`} title={label}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-identity">
          {businessName && <span className="sidebar-business">{businessName}</span>}
          <ThemeToggle />
        </div>
        <button
          className="secondary icon"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          <SignOutIcon size={16} />
          <span className="sidebar-nav-label">Log out</span>
        </button>
      </div>
    </aside>
    <Link href="/quests/new" className="sidebar-create-fab mobile-fab" aria-label="Create quest" title="Create quest">
      <PlusIcon size={20} />
    </Link>
    </>
  );
}
