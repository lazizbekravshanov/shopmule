import { getServerSession } from "next-auth"
// @ts-ignore
import jwt from "jsonwebtoken"
import { authOptions } from "./auth"
import type { Role } from "@prisma/client"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

interface MobileAuthPayload {
  id: string
  email: string
  role: Role
}

interface AuthResult {
  authenticated: boolean
  user?: MobileAuthPayload
  error?: string
}

/**
 * Verify authentication for mobile API endpoints.
 * Supports both:
 * 1. Next-auth session (cookie-based, for web)
 * 2. Bearer token (JWT, for mobile)
 */
export async function verifyMobileAuth(request: Request): Promise<AuthResult> {
  // First, try Bearer token authentication
  const authHeader = request.headers.get("authorization")

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7)

    if (!JWT_SECRET) {
      return {
        authenticated: false,
        error: "JWT authentication not configured",
      }
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as MobileAuthPayload
      return {
        authenticated: true,
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role,
        },
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          authenticated: false,
          error: "Token expired",
        }
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          authenticated: false,
          error: "Invalid token",
        }
      }
      return {
        authenticated: false,
        error: "Token verification failed",
      }
    }
  }

  // Fall back to session-based authentication (for web dashboard)
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      return {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email || "",
          role: session.user.role,
        },
      }
    }
  } catch (error) {
    console.error("Session verification error:", error)
  }

  return {
    authenticated: false,
    error: "No valid authentication provided",
  }
}

/**
 * Verify authentication and require specific roles.
 */
export async function verifyMobileAuthWithRoles(
  request: Request,
  allowedRoles: Role[]
): Promise<AuthResult> {
  const result = await verifyMobileAuth(request)

  if (!result.authenticated || !result.user) {
    return result
  }

  if (!allowedRoles.includes(result.user.role)) {
    return {
      authenticated: false,
      error: "Insufficient permissions",
    }
  }

  return result
}
