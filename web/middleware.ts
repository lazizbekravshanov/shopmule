import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add shopId to headers for downstream use
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/repair-orders/:path*",
    "/technicians/:path*",
    "/time-clock/:path*",
    "/invoices/:path*",
    "/api/customers/:path*",
    "/api/vehicles/:path*",
    "/api/repair-orders/:path*",
    "/api/attendance/:path*",
    "/api/time-entries/:path*",
    "/api/invoices/:path*",
  ],
}
