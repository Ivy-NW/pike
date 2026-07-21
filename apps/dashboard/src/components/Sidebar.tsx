"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { clearToken } from "@/lib/auth";
import { ChartIcon, CompassIcon, GearIcon, GiftIcon, GridIcon, PlusIcon, SignOutIcon } from "./icons";

const links = [
  { href: "/home", label: "Dashboard", icon: GridIcon },
  { href: "/quests", label: "Quests", icon: CompassIcon },
  { href: "/rewards", label: "Rewards", icon: GiftIcon },
  { href: "/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
];

export function Sidebar({ businessName }: { businessName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size={26} />
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--primary)", lineHeight: 1 }}>PIKE</div>
          <div className="sidebar-brand-label">Business Portal</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle />
        </div>
      </div>

      <Link href="/quests/new" className="primary icon sidebar-create">
        <PlusIcon size={16} />
        Create quest
      </Link>

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
        {businessName && <span className="sidebar-business">{businessName}</span>}
        <button
          className="secondary icon"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          <SignOutIcon size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
