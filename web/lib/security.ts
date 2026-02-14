import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { Role } from "@prisma/client"
import { NextRequest } from "next/server"

export interface AuthenticatedSession {
  user: {
    id: string
    email: string
    name?: string | null
    role: Role
    tenantId: string | null
    shopId: string | null
  }
}

export async function getAuthSession(): Promise<AuthenticatedSession | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }
  return session as AuthenticatedSession
}

// Role-based access control
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

// Input sanitization
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

// ID validation
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export function isValidCuid(str: string): boolean {
  const cuidRegex = /^c[a-z0-9]{20,30}$/
  return cuidRegex.test(str)
}

export function isValidId(str: string): boolean {
  return isValidUUID(str) || isValidCuid(str)
}

// Rate limiting configuration
export function rateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`
}

export const RATE_LIMITS = {
  login: { max: 5, window: 60 * 15 }, // 5 attempts per 15 minutes
  api: { max: 100, window: 60 }, // 100 requests per minute
  create: { max: 30, window: 60 }, // 30 creates per minute
} as const

// In-memory rate limiter (for development/simple deployments)
// For production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMITS
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[action]
  const key = rateLimitKey(identifier, action)
  const now = Date.now()

  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.window * 1000,
    })
    return { allowed: true, remaining: config.max - 1, resetIn: config.window }
  }

  if (record.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: config.max - record.count,
    resetIn: Math.ceil((record.resetTime - now) / 1000),
  }
}

// CSRF token helpers
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Request validation
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }
  return "unknown"
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return { valid: errors.length === 0, errors }
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Phone validation (basic)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 7
}

// SQL injection prevention helper
export function escapeSQLLike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&")
}

// Security event logging
export type SecurityEvent =
  | "login_success"
  | "login_failure"
  | "logout"
  | "password_change"
  | "permission_denied"
  | "rate_limit_exceeded"
  | "suspicious_activity"

export function logSecurityEvent(
  event: SecurityEvent,
  details: {
    userId?: string
    ip?: string
    userAgent?: string
    metadata?: Record<string, unknown>
  }
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  }

  // In production, send to security monitoring service
  console.log("[SECURITY]", JSON.stringify(logEntry))
}

// Content-Type validation
export function isValidContentType(
  contentType: string | null,
  allowedTypes: string[]
): boolean {
  if (!contentType) return false
  const mainType = contentType.split(";")[0].trim().toLowerCase()
  return allowedTypes.some((allowed) => mainType === allowed.toLowerCase())
}

// File upload validation
export function validateFileUpload(
  file: { name: string; size: number; type: string },
  options: {
    maxSize?: number // bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` }
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` }
  }

  if (allowedExtensions.length > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!ext || !allowedExtensions.includes(ext)) {
      return { valid: false, error: `File extension .${ext} not allowed` }
    }
  }

  return { valid: true }
}
