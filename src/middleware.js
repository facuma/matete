import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/api/admin");
        const isAdminLogin = req.nextUrl.pathname === "/admin/login";

        // Allow access to admin login without authentication
        if (isAdminLogin) {
            return NextResponse.next();
        }

        // Check if user is admin for /admin/* routes (pages and API)
        if (isAdminRoute && token?.role !== "admin") {
            if (req.nextUrl.pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
                const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/admin");
                const isAdminLogin = req.nextUrl.pathname === "/admin/login";
                const isMyOrders = req.nextUrl.pathname === "/my-orders";

                // Admin login is public
                if (isAdminLogin) return true;

                // Allow API admin routes to pass through to the middleware function
                // where we handle the 401 response manually
                if (isApiAdminRoute) return true;

                // Admin pages require authentication
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
    matcher: ["/admin/:path*", "/api/admin/:path*", "/my-orders"]
};
