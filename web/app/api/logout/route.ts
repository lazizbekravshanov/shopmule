import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// All possible NextAuth cookie names
const AUTH_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
];

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear all auth-related cookies using the cookies() API
  const cookieStore = await cookies();

  for (const name of AUTH_COOKIES) {
    // Delete the cookie
    cookieStore.delete(name);

    // Also set it to expire immediately with response cookies
    response.cookies.set(name, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  return response;
}

export async function GET(request: Request) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const response = NextResponse.redirect(new URL('/', baseUrl));

  // Clear all auth-related cookies
  const cookieStore = await cookies();

  for (const name of AUTH_COOKIES) {
    // Delete the cookie
    cookieStore.delete(name);

    // Also set it to expire immediately with response cookies
    response.cookies.set(name, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  return response;
}
