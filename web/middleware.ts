import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/work-orders",
  "/invoices",
  "/customers",
  "/inventory",
  "/employees",
  "/settings",
  "/reports",
]

// Routes that are always public
const publicRoutes = [
  "/login",
  "/register",
  "/pay", // Customer payment portal
  "/",    // Landing page
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    // If user is logged in and tries to access login page, redirect to dashboard
    if (pathname === "/login") {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      })
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(route + "/")
  )

  if (isProtectedRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      // Redirect to login with callback URL
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Optional: Role-based access control
    // const userRole = token.role as string
    // if (pathname.startsWith("/settings") && userRole !== "ADMIN") {
    //   return NextResponse.redirect(new URL("/dashboard", request.url))
    // }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Run middleware on all routes except API, static files, and images
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
