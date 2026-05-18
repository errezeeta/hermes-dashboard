import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const AUTH_COOKIE = "hb_auth";

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  const { user, pass } = await request.json().catch(() => ({ user: "", pass: "" }));

  const envUser = process.env.APP_USER || "";
  const envPass = process.env.APP_PASS || "";

  if (!envUser || !envPass) {
    return NextResponse.json({ ok: false, error: "Auth not configured" }, { status: 500 });
  }

  const ok = timingSafeEqual(user, envUser) && timingSafeEqual(pass, envPass);
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "0", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
