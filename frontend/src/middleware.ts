import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/forgot-password"];
const PUBLIC_FILE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json)$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const isLandingPage = pathname === "/";
  const isAuthPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isPublic = isLandingPage || isAuthPage;

  // Auth state is in localStorage (client-side Zustand persist) — we use a cookie for SSR guard
  const token = request.cookies.get("syncops-token")?.value;
  const hasValidToken = Boolean(token && token !== "syncops-demo-token");

  if (!isPublic && !hasValidToken) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token === "syncops-demo-token") {
      response.cookies.delete("syncops-token");
    }
    return response;
  }

  if (isPublic && token === "syncops-demo-token") {
    const response = NextResponse.next();
    response.cookies.delete("syncops-token");
    return response;
  }

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && hasValidToken) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
