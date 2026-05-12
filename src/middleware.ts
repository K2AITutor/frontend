import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleHomeMap: Record<string, string> = {
  admin: "/admin",
  student: "/student",
  teacher: "/teacher/review",
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;
    const profileCompleted = token?.profileCompleted as boolean | undefined;

    const isAuthPage = pathname.startsWith("/auth");
    const isCompleteProfile = pathname === "/auth/complete-profile";

    const isProfileIncomplete = token && profileCompleted !== true && role !== "admin";

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

    if (pathname.startsWith("/parent")) {
      return NextResponse.redirect(
        new URL(roleHomeMap[role ?? ""] ?? "/auth/login", req.url)
      );
    }

    const roleRoutes = ["admin", "student", "teacher"];
    for (const routeRole of roleRoutes) {
      if (pathname.startsWith(`/${routeRole}`) && role !== routeRole) {
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
    "/student/:path*",
    "/parent/:path*",
    "/teacher/:path*",
    "/auth/:path*",
  ],
};
