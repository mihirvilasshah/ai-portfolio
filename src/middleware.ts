import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Export the auth middleware
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/forgot-password", "/api/auth"];
  const isPublicRoute = publicRoutes.some(
    (route) => nextUrl.pathname.startsWith(route)
  );

  // API routes that should be accessible without auth (for testing)
  const publicApiRoutes = ["/api/quotes", "/api/screener"];
  const isPublicApi = publicApiRoutes.some(
    (route) => nextUrl.pathname.startsWith(route)
  );

  // Allow public routes and public APIs
  if (isPublicRoute || isPublicApi) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
