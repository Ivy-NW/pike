"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { clearToken } from "@/lib/auth";
import {
  BuildingIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CompassIcon,
  FlagIcon,
  GridIcon,
  KeyIcon,
  MailIcon,
  ShieldIcon,
  SignOutIcon,
  UsersIcon,
} from "./icons";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: GridIcon },
  { href: "/businesses", label: "Businesses", icon: UsersIcon },
  { href: "/venues", label: "Venues", icon: BuildingIcon },
  { href: "/quests", label: "Quests", icon: CompassIcon },
  { href: "/redemptions", label: "Redemptions", icon: FlagIcon },
  { href: "/attestations", label: "Attestations", icon: ShieldIcon },
  { href: "/gate-attempts", label: "Gate log", icon: KeyIcon },
  { href: "/audit-log", label: "Audit log", icon: ClockIcon },
  { href: "/leads", label: "Free marker leads", icon: MailIcon },
];

const COLLAPSE_KEY = "pike-admin-sidebar-collapsed";

export function Sidebar({ adminEmail }: { adminEmail?: string }) {
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
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-brand">
        <Logo size={26} />
        <div className="sidebar-brand-text">
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, lineHeight: 1 }}>PIKE</div>
          <div className="sidebar-brand-label">Global Admin Portal</div>
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
      <nav className="sidebar-nav" aria-label="Admin portal">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={`sidebar-link${active ? " active" : ""}`} title={label}>
              <Icon size={18} />
              <span className="sidebar-nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-identity">
          {adminEmail && <span className="sidebar-admin-email">{adminEmail}</span>}
          <ThemeToggle />
        </div>
        <button
          className="danger icon"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          <SignOutIcon size={16} />
          <span className="sidebar-nav-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
