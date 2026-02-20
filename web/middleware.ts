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
  "/schedule",
  "/fleet-accounts",
  "/time-clock",
  "/repair-orders",
  "/integrations",
  "/help",
]

// Routes that are always public
const publicRoutes = [
  "/login",
  "/register",
  "/signout", // Sign out page
  "/pay",     // Customer payment portal
  "/portal",  // Customer portal
  "/contact", // Contact form
  "/blog",    // Blog
  "/",        // Landing page
]

// API routes that are public (no auth required)
const publicApiRoutes = [
  "/api/auth",
  "/api/health",
  "/api/fmcsa",
  "/api/contact",
  "/api/mobile/auth", // Mobile login endpoint
  "/api/portal",      // Customer portal API (token-based auth)
  "/api/pay",         // Customer payment API (token-based auth)
]

// API routes that handle their own auth (support Bearer tokens)
const selfAuthApiRoutes = [
  "/api/ai",            // AI copilot (handles its own session auth)
  "/api/vehicles/search",
  "/api/vehicles/", // For /api/vehicles/[id] routes
  "/api/vin/decode",
  "/api/mobile",
  "/api/work-orders",
  "/api/customers",
  "/api/time-entries",
  "/api/attendance", // Time clock endpoints for mobile
  "/api/shops",      // Shop management
  "/api/geofences",  // Geofence management
  "/api/timesheets", // Timesheet data
  "/api/fleet-accounts", // Fleet account management
  "/api/appointments",   // Appointment scheduling
  "/api/tenant",         // Tenant settings
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

    // Check if API route handles its own auth (supports Bearer token)
    const isSelfAuthRoute = selfAuthApiRoutes.some(
      route => pathname === route || pathname.startsWith(route + "/")
    )

    // Skip middleware auth check for public routes and self-auth routes
    if (!isPublicApiRoute && !isSelfAuthRoute) {
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
    // But allow access if they just signed out (check for signedOut param or referrer)
    if (pathname === "/login") {
      // Don't redirect if coming from signout
      const signedOut = request.nextUrl.searchParams.get('signedOut')
      if (signedOut === 'true') {
        return response
      }

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
