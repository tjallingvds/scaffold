import { NextResponse, type NextRequest } from "next/server";

// Auth is disabled by default. The whole app is open; only a few paths exist
// just so the routing doesn't try to match them against auth middleware.
// (Set ENABLE_AUTH=true and configure AUTH_SECRET to re-enable.)
const AUTH_ENABLED = process.env.ENABLE_AUTH === "true";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/student",
  "/api/auth",
  "/api/signup",
  "/api/chat",
  "/api/effort-check",
];

function isPublic(pathname: string): boolean {
  if (pathname === "/favicon.ico") return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request: NextRequest) {
  if (!AUTH_ENABLED) return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  // Lazy import so edge bundle stays small when auth is off.
  const { getToken } = await import("next-auth/jwt");
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    salt:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)",
  ],
};
