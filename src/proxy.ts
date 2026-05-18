import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    return new NextResponse("Auth not configured", { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic realm=\"marlonbot\"" },
    });
  }

  const base64 = auth.replace("Basic ", "");
  let decoded = "";
  try {
    decoded = Buffer.from(base64, "base64").toString("utf8");
  } catch {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic realm=\"marlonbot\"" },
    });
  }

  const [inUser, inPass] = decoded.split(":");
  if (inUser !== user || inPass !== pass) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic realm=\"marlonbot\"" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
