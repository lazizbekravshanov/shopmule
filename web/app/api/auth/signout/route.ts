import { NextResponse } from "next/server"

export async function POST() {
  // NextAuth signout is handled client-side
  // This endpoint just redirects
  return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"))
}
