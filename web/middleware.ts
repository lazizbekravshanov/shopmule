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
  "/technicians",
  "/settings",
  "/reports",
  "/tv",
]

// Routes that are always public
const publicRoutes = [
  "/login",
  "/register",
  "/pay", // Customer payment portal
  "/",    // Landing page
]

// API routes that are public (no auth required)
const publicApiRoutes = [
  "/api/auth",
  "/api/health",
]

// In-memory rate limiter store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  const realIP = request.headers.get("x-real-ip")
  return realIP || "unknown"
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Add security headers to all responses
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = getClientIP(request)

    // Stricter rate limit for auth endpoints
    if (pathname.startsWith("/api/auth")) {
      if (!checkRateLimit(`auth:${ip}`, 20, 60 * 1000)) { // 20 requests per minute
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": "60" } }
        )
      }
    } else {
      // General API rate limit
      if (!checkRateLimit(`api:${ip}`, 100, 60 * 1000)) { // 100 requests per minute
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": "60" } }
        )
      }
    }

    // Check if API route requires auth
    const isPublicApiRoute = publicApiRoutes.some(
      route => pathname === route || pathname.startsWith(route + "/")
    )

    if (!isPublicApiRoute) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      })

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    return response
  }

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
    return response
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

    // Role-based access control for admin-only routes
    const adminOnlyRoutes = ["/settings", "/employees"]
    const userRole = token.role as string

    if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      if (userRole !== "ADMIN" && userRole !== "MANAGER") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    // Run middleware on all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
