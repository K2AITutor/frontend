import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;
    const profileCompleted = token?.profileCompleted as boolean | undefined;

    const isAuthPage = pathname.startsWith("/auth");
    const isCompleteProfile = pathname === "/auth/complete-profile";

    const isProfileIncomplete = token && profileCompleted !== true && role !== 'admin';

    // Allow access to complete-profile page if profile is incomplete
    if (isCompleteProfile) {
      if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));
      if (!isProfileIncomplete) {
        return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/student", req.url));
      }
      return NextResponse.next();
    }

    // Redirect incomplete profiles to complete-profile page
    if (isProfileIncomplete && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/complete-profile", req.url));
    }

    if (token && isAuthPage) {
      if (role === 'admin') return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (pathname.startsWith("/student") && role !== "student") {
      if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.redirect(new URL("/auth/login", req.url));
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
  matcher: ["/admin/:path*", "/student/:path*", "/auth/:path*"],
};
