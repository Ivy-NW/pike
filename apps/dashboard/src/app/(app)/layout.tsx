"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [businessName, setBusinessName] = useState<string | undefined>();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
    api.me().then((me) => setBusinessName(me?.name)).catch(() => {});
  }, [router]);

  if (!ready) return (
    <main className="route-loading" aria-live="polite">
      <span className="loading-mark" aria-hidden="true" />
      <p>Verifying your workspace&hellip;</p>
    </main>
  );

  return (
    <div className="app-shell">
      <Sidebar businessName={businessName} />
      <main className="app-content">{children}</main>
    </div>
  );
}
