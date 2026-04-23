import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDemoMode } from "@/lib/mode";

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
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  // Demo mode: no DB, no auth. Everything open.
  if (isDemoMode()) return NextResponse.next();

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
