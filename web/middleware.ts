import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import type { Role } from "@prisma/client"
import { roleHasPermission, type Permission } from "@/lib/auth/permissions"

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
  "/integrations",
  "/help",
  "/payroll",
  "/efficiency",
  "/workflow",
]

// Routes that are always public
const publicRoutes = [
  "/login",
  "/register",
  "/signout", // Sign out page
  "/pay",     // Customer payment portal
  "/portal",  // Customer portal
  "/contact", // Contact form
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
  "/api/payroll",        // Payroll endpoints
  "/api/employees",      // Employee endpoints (deductions, loans, etc.)
  "/api/efficiency",     // Efficiency endpoints
  "/api/billing",        // Billing endpoints (session auth)
]

// Origin validation for CSRF protection on mutations
function validateOrigin(request: NextRequest): boolean {
  // Safe methods don't need origin checks
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true

  const origin = request.headers.get("origin")
  const host = request.headers.get("host")

  // No origin = same-origin request (non-browser clients)
  if (!origin) return true

  // Allow localhost in development
  if (process.env.NODE_ENV === "development") {
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) return true
  }

  // Origin must match host
  try {
    const originUrl = new URL(origin)
    const allowedHosts = [
      host,
      process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, "").split("/")[0],
      process.env.VERCEL_URL,
    ].filter(Boolean)

    return allowedHosts.some((allowed) => {
      if (!allowed) return false
      const allowedHost = allowed.replace(/^https?:\/\//, "").split("/")[0]
      return originUrl.host === allowedHost
    })
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Add security headers to all responses
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)")
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com;"
    )
  }

  // API route handling
  if (pathname.startsWith("/api/")) {
    // Origin validation — reject cross-origin mutations (CSRF protection)
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: "Forbidden: invalid origin" },
        { status: 403 }
      )
    }

    // Rate limiting is handled at the route level via DB-backed checkRateLimit()
    // (middleware runs on Edge runtime and cannot access the database)

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

    // Permission-based route access control (no DB call — role-only check)
    const ROUTE_PERMISSIONS: Record<string, Permission> = {
      "/settings": "org:view_settings",
      "/employees": "users:read",
      "/technicians": "users:read",
      "/reports": "reports:view_operational",
      "/inventory": "inventory:read",
      "/invoices": "invoices:read",
      "/fleet-accounts": "customers:read",
      "/work-orders": "service_orders:read_own",
      "/customers": "customers:read",
      "/schedule": "service_orders:read_own",
      "/time-clock": "time:clock_self",
      "/integrations": "org:manage_settings",
      "/payroll": "reports:view_financial",
      "/efficiency": "reports:view_operational",
      "/workflow": "service_orders:read_own",
    }

    const userRole = token.role as Role
    for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname === route || pathname.startsWith(route + "/")) {
        if (!roleHasPermission(userRole, permission)) {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        break
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
