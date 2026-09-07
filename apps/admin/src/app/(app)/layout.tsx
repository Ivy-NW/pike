"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { getAdminEmail, getToken } from "@/lib/auth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | undefined>();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setAdminEmail(getAdminEmail() ?? undefined);
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar adminEmail={adminEmail} />
        <main className="app-content">{children}</main>
      </div>
    </ToastProvider>
  );
}
