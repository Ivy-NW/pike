"use client";
import { useEffect, useState, type ReactNode } from "react";
import { AdminGateModal } from "./AdminGateModal";

/**
 * Hidden entry point to the admin code gate -- no visible "Admin" link exists anywhere on
 * this page. Two ways in, both undiscoverable by casual browsing: a keyboard shortcut, and
 * a click target disguised as the ordinary copyright text passed as children.
 */
export function AdminGateTrigger({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: "default" }}>
        {children}
      </span>
      {open && <AdminGateModal onClose={() => setOpen(false)} />}
    </>
  );
}
