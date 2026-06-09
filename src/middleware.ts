import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleHomeMap: Record<string, string> = {
  admin: "/admin",
  contributor: "/contributor",
  student: "/student",
  teacher: "/teacher/review",
  parent: "/parent",
};

const routeAccessMap: Record<string, string[]> = {
  admin: ["admin"],
  contributor: ["admin", "contributor", "teacher"],
  student: ["student"],
  teacher: ["teacher"],
  parent: ["parent"],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;
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
        return NextResponse.redirect(new URL(roleHomeMap[role ?? ""] ?? "/student", req.url));
      }
      return NextResponse.next();
    }

    if (isProfileIncomplete && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/complete-profile", req.url));
    }

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL(roleHomeMap[role ?? ""] ?? "/student", req.url));
    }

    for (const [routeRole, allowedRoles] of Object.entries(routeAccessMap)) {
      if (
        pathname.startsWith(`/${routeRole}`) &&
        !allowedRoles.includes(String(role))
      ) {
        return NextResponse.redirect(
          new URL(roleHomeMap[role ?? ""] ?? "/auth/login", req.url)
        );
      }
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

export const config = {
  matcher: [
    "/admin/:path*",
    "/contributor/:path*",
    "/student/:path*",
    "/parent/:path*",
    "/teacher/:path*",
    "/auth/:path*",
  ],
};
