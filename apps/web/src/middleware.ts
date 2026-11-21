import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { homeForRole, isRoleAllowedForPath, normalizeRole } from "@/lib/roleRouting";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = normalizeRole(token?.role);
    const profileCompleted = token?.profileCompleted as boolean | undefined;

    const isAuthPage = pathname.startsWith("/auth");
    const isCompleteProfile = pathname === "/auth/complete-profile";

    const isProfileIncomplete =
      token &&
      profileCompleted !== true &&
      !["admin", "contributor"].includes(String(role));

    if (isCompleteProfile) {
      if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));
      if (!isProfileIncomplete) {
        return NextResponse.redirect(new URL(homeForRole(role), req.url));
      }
      return NextResponse.next();
    }

    if (isProfileIncomplete && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/complete-profile", req.url));
    }

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL(homeForRole(role), req.url));
    }

    if (!isRoleAllowedForPath(pathname, role)) {
      return NextResponse.redirect(
        new URL(homeForRole(role, "/auth/login"), req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith("/auth")) return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

// Keep in sync with `routeAccessMap` in lib/roleRouting.ts: a protected prefix that
// is missing here is never checked. Must stay a static literal (Next.js reads it at build time).
export const config = {
  matcher: [
    "/admin/:path*",
    "/contributor/:path*",
    "/student/:path*",
    "/parent/:path*",
    "/teacher/:path*",
    "/exam/:path*",
    "/tools/:path*",
    "/auth/:path*",
  ],
};
