"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { clearToken } from "@/lib/auth";
import { BuildingIcon, CompassIcon, FlagIcon, GridIcon, SignOutIcon, UsersIcon } from "./icons";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: GridIcon },
  { href: "/businesses", label: "Businesses", icon: UsersIcon },
  { href: "/venues", label: "Venues", icon: BuildingIcon },
  { href: "/quests", label: "Quests", icon: CompassIcon },
  { href: "/redemptions", label: "Redemptions", icon: FlagIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size={26} />
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--primary)", lineHeight: 1 }}>PIKE</div>
          <div className="sidebar-brand-label">Global Admin Portal</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle />
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={`sidebar-link${active ? " active" : ""}`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button
          className="danger icon"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          <SignOutIcon size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
