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

    const isProfileIncomplete =
      token &&
      profileCompleted !== true &&
      !["admin", "contributor"].includes(String(role));

    if (isCompleteProfile) {
      if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));
      if (!isProfileIncomplete) {
        if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
        if (role === "contributor") return NextResponse.redirect(new URL("/contributor", req.url));
        return NextResponse.redirect(new URL("/student", req.url));
      }
      return NextResponse.next();
    }

    if (isProfileIncomplete && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/complete-profile", req.url));
    }

    if (token && isAuthPage) {
      if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "contributor") return NextResponse.redirect(new URL("/contributor", req.url));
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      if (role === "contributor") return NextResponse.redirect(new URL("/contributor", req.url));
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (pathname.startsWith("/contributor") && !["contributor", "teacher", "admin"].includes(String(role))) {
      if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (pathname.startsWith("/student") && role !== "student") {
      if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "contributor") return NextResponse.redirect(new URL("/contributor", req.url));
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
  matcher: ["/admin/:path*", "/student/:path*", "/contributor/:path*", "/auth/:path*"],
};