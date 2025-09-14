import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes
const protectedRoutes = ["/dashboard", "/notes", "/profile", "/settings", "/shared"]
const adminRoutes = ["/admin"]
const publicRoutes = ["/", "/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value
  const userRole = request.cookies.get("user_role")?.value

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // If accessing admin routes
  if (isAdminRoute) {
    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL("/", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Not an admin - redirect to dashboard
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Admin with token - allow access
    return NextResponse.next()
  }

  // If accessing protected routes
  if (isProtectedRoute) {
    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL("/", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Has token - allow access
    return NextResponse.next()
  }

  // If accessing public routes while authenticated
  if (isPublicRoute && token) {
    // Redirect based on role
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url))
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Allow access to all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
