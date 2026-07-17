import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
// Server-only (no NEXT_PUBLIC_ prefix) -- the point of this route is that the real
// admin hostname never ships in the public JS bundle, only in a response reachable
// after a valid gate code. Re-verifies server-side so this route can't be used as a
// blind open redirect to the admin host by anyone who skips the modal.
const ADMIN_URL = process.env.ADMIN_URL;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "";
  const origin = req.nextUrl.origin;

  const verifyRes = await fetch(`${API_BASE_URL}/admin-gate/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  }).catch(() => null);

  const valid = verifyRes?.ok ? ((await verifyRes.json()) as { valid: boolean }).valid : false;
  if (!valid || !ADMIN_URL) {
    return NextResponse.redirect(origin);
  }

  return NextResponse.redirect(`${ADMIN_URL}/login`);
}
