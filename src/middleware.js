import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
        const isAdminLogin = req.nextUrl.pathname === "/admin/login";

        // Allow access to admin login without authentication
        if (isAdminLogin) {
            return NextResponse.next();
        }

        // Check if user is admin for /admin/* routes
        if (isAdminRoute && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
                const isAdminLogin = req.nextUrl.pathname === "/admin/login";
                const isMyOrders = req.nextUrl.pathname === "/my-orders";

                // Admin login is public
                if (isAdminLogin) return true;

                // Admin routes require authentication
                if (isAdminRoute) return !!token;

                // My orders requires authentication (any user)
                if (isMyOrders) return !!token;

                // Everything else is public
                return true;
            }
        }
    }
);

export const config = {
    matcher: ["/admin/:path*", "/my-orders"]
};
