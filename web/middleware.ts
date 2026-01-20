import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple middleware - auth is handled client-side with localStorage token
// Protected routes will redirect to login if no token is found (handled in layout)
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip static files and api routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
