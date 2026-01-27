import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    const isLoginPage = pathname === "/auth/login";
    const isDashboard = pathname.startsWith("/parent");

    if (req.nextauth.token && isLoginPage) {
      return NextResponse.redirect(new URL("/parent", req.url));
    }

    if (!req.nextauth.token && isDashboard) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/auth/login", "/parent/:path*"],
};
