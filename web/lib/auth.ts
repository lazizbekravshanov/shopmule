import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import type { Role } from "@prisma/client"

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
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  events: {
    async signOut() {
      console.log('[Auth] User signed out');
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Temporarily enable for debugging
}
