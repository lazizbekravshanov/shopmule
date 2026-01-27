import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear all auth-related cookies by setting them to expire immediately
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
  ];

  for (const name of cookieNames) {
    // Set cookie to empty with immediate expiration
    response.cookies.set(name, '', {
      expires: new Date(0),
      path: '/',
    });
    // Also try to delete it
    response.cookies.delete({
      name,
      path: '/',
    });
  }

  return response;
}

export async function GET(request: Request) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const response = NextResponse.redirect(new URL('/', baseUrl));

  // Clear all auth-related cookies by setting them to expire immediately
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
  ];

  for (const name of cookieNames) {
    // Set cookie to empty with immediate expiration
    response.cookies.set(name, '', {
      expires: new Date(0),
      path: '/',
    });
    // Also try to delete it
    response.cookies.delete({
      name,
      path: '/',
    });
  }

  return response;
}
