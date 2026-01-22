import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only run middleware on app pages, skip all API routes and static files
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
