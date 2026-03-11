import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;

    const isAuthPage = pathname.startsWith("/auth");

    if (token && isAuthPage) {
      if (role === 'admin') return NextResponse.redirect(new URL("/admin", req.url));
      if (role === 'parent') return NextResponse.redirect(new URL("/parent", req.url));
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/student", req.url)); // Default fallback or login
    }

    if (pathname.startsWith("/parent") && role !== "parent") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (pathname.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/", req.url));
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
  matcher: ["/admin/:path*", "/parent/:path*", "/student/:path*", "/auth/:path*"],
};
