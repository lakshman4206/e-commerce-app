import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "",
  });

  const isAuthenticated = !!token;
  const userRole = token?.role as string | undefined;

  // 1. Admin Area Protection (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "ADMIN") {
      // Non-admin customer forbidden from accessing dashboard
      const forbiddenUrl = new URL("/unauthorized", req.url);
      return NextResponse.redirect(forbiddenUrl);
    }

    return NextResponse.next();
  }

  // 2. Customer Protected Routes (/checkout, /orders, /account)
  const isProtectedCustomerRoute =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/account");

  if (isProtectedCustomerRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Auth Redirection (prevent logged in users from visiting /login or /register)
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (isAuthRoute && isAuthenticated) {
    const destination = userRole === "ADMIN" ? "/admin" : "/";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
