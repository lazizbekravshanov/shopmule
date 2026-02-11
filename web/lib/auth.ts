import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import type { Role } from "@prisma/client"

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production'
const useSecureCookies = isProduction && process.env.NEXTAUTH_URL?.startsWith('https')

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[Auth] Login attempt:', credentials?.email ? 'email provided' : 'no email')

        // Strict validation - require both email and password
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          throw new Error('Email and password are required')
        }

        const email = credentials.email.trim().toLowerCase()
        const password = credentials.password

        if (!email || !password) {
          console.log('[Auth] Empty credentials after trim')
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          console.log('[Auth] User not found:', email)
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
          console.log('[Auth] Invalid password for:', email)
          throw new Error('Invalid email or password')
        }

        console.log('[Auth] Login successful:', email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: useSecureCookies ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: useSecureCookies ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: useSecureCookies ? '__Secure-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/signout",
  },
  events: {
    async signOut() {
      console.log('[Auth] User signed out');
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
