import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { Role } from "@prisma/client"

export interface AuthenticatedSession {
  user: {
    id: string
    email: string
    name?: string | null
    role: Role
    shopId: string
  }
}

export async function getAuthSession(): Promise<AuthenticatedSession | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.shopId) {
    return null
  }
  return session as AuthenticatedSession
}

export function hasPermission(
  userRole: Role,
  allowedRoles: Role[]
): boolean {
  return allowedRoles.includes(userRole)
}

export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN
}

export function isManager(role: Role): boolean {
  return role === Role.ADMIN || role === Role.MANAGER
}

export function canManageUsers(role: Role): boolean {
  return role === Role.ADMIN || role === Role.MANAGER
}

export function canManageShop(role: Role): boolean {
  return role === Role.ADMIN
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Basic XSS prevention
    .slice(0, 10000) // Limit length
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export function rateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`
}

export const RATE_LIMITS = {
  login: { max: 5, window: 60 * 15 }, // 5 attempts per 15 minutes
  api: { max: 100, window: 60 }, // 100 requests per minute
  create: { max: 30, window: 60 }, // 30 creates per minute
} as const
