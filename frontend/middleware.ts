import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "e-com-web-super-secret-auth-key-32chars-minimum";

  let token = null;
  try {
    const cookieNames = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.session-token",
    ];

    for (const cookieName of cookieNames) {
      if (req.cookies.has(cookieName)) {
        token = await getToken({
          req,
          secret,
          cookieName,
          secureCookie: cookieName.startsWith("__Secure-"),
        });
        if (token) break;
      }
    }

    if (!token) {
      token = await getToken({
        req,
        secret,
      });
    }
  } catch (err) {
    console.error("[MIDDLEWARE_AUTH_ERROR]:", err);
  }

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
