// Next.js middleware for route protection
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Auth routes - redirect authenticated users away
  if (
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/signup")
  ) {
    if (session) {
      // Authenticated users trying to access auth pages should go to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Unauthenticated users can access auth pages
    return NextResponse.next();
  }

  // Home page - allow both authenticated and unauthenticated users
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!session) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated users can access protected routes
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
