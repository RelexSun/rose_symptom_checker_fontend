// Next.js middleware for route protection
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CurrentUser {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  full_name?: string;
  role_id?: number;
  role_name?: string;
}

async function getCurrentUserFromToken(
  token: string
): Promise<CurrentUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Handle BaseResponse wrapper if present
    if (data && typeof data === "object" && "success" in data) {
      if (!data.success) {
        return null;
      }
      return data.data as CurrentUser;
    }

    return data as CurrentUser;
  } catch {
    return null;
  }
}

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

  const isAdminRoute = pathname.startsWith("/admin");

  // Protected routes - require authentication
  if (!session) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin routes - require admin role (role_id 1 = admin, role_id 2 = user)
  if (isAdminRoute) {
    const token = (session as any)?.token as string | undefined;

    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const currentUser = await getCurrentUserFromToken(token);

    const isAdmin =
      currentUser &&
      (currentUser.role_id === 1 ||
        currentUser.role_name?.toLowerCase() === "admin");

    if (!isAdmin) {
      // Non-admin users are not allowed to access admin routes
      return NextResponse.redirect(new URL("/", request.url));
    }
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
