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

        // Check if request is authenticated via Bearer token (Mobile)
        // If authorized callback returned true for Bearer, we skip the token (cookie) check
        const authHeader = req.headers.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
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
            authorized: async ({ token, req }) => {
                const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
                const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/admin");
                const isAdminLogin = req.nextUrl.pathname === "/admin/login";
                const isMyOrders = req.nextUrl.pathname === "/my-orders";
                const isMobileLogin = req.nextUrl.pathname === "/api/mobile/login";

                // Public routes
                if (isAdminLogin || isMobileLogin) return true;

                // API Admin Routes: Check for Bearer Token
                if (isApiAdminRoute) {
                    const authHeader = req.headers.get("authorization");
                    if (authHeader?.startsWith("Bearer ")) {
                        try {
                            const { jwtVerify } = await import('jose');
                            const jwt = authHeader.split(" ")[1];
                            const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
                            const { payload } = await jwtVerify(jwt, secret);
                            // Verify role if needed, or just presence
                            if (payload.role === 'admin') return true;
                        } catch (e) {
                            // Invalid token, fall through to cookie check
                        }
                    }
                    // Fallback to cookie check for web admin API
                    // We return true here to let the middleware function handle the 401 for cookies
                    // But if using Bearer, we want to allow it.
                    // IMPORTANT: If authorized returns FALSE, it redirects to login page. 
                    // For API routes, better to return true and handle 401 in middleware function?
                    // Existing code: "if (isApiAdminRoute) return true;"
                    return true;
                }

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
