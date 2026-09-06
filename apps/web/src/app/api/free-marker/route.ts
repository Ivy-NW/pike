import { NextResponse } from "next/server";
import { api, ApiError } from "@/lib/api";

const PHONE = /^\+?[0-9\s-]{9,18}$/;

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const venueName = typeof data.venueName === "string" ? data.venueName.trim() : "";
  const whatsapp = typeof data.whatsapp === "string" ? data.whatsapp.trim() : "";
  const neighbourhood = typeof data.neighbourhood === "string" ? data.neighbourhood.trim() : "";
  if (name.length < 2 || name.length > 80 || venueName.length < 2 || venueName.length > 120 || !PHONE.test(whatsapp) || neighbourhood.length > 100) {
    return NextResponse.json({ ok: false, message: "Check the details and try again." }, { status: 400 });
  }
  // Do not log lead data here: the WhatsApp number is personal information.
  try {
    await api.requestFreeMarker(name, venueName, whatsapp, neighbourhood || undefined);
  } catch (error) {
    const status = error instanceof ApiError && error.statusCode < 500 ? 400 : 502;
    return NextResponse.json({ ok: false, message: "We couldn't save that request. Please try again." }, { status });
  }
  return NextResponse.json({ ok: true, message: "Request received." });
}
