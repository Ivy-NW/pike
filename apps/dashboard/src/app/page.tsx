"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getToken() ? "/home" : "/login");
  }, [router]);
  return (
    <main className="route-loading" aria-live="polite">
      <span className="loading-mark" aria-hidden="true" />
      <p>Opening your PIKE workspace&hellip;</p>
    </main>
  );
}
