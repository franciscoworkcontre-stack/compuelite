import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect /admin — require ADMIN role
    if (pathname.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login?callbackUrl=/admin", req.url));
      }
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // /cuenta requires any authenticated user
        if (pathname.startsWith("/cuenta")) return Boolean(token);
        // /admin is handled in the middleware function above
        if (pathname.startsWith("/admin")) return true; // let middleware decide
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
