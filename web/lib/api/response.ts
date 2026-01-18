import { NextResponse } from "next/server"
import { ZodError } from "zod"

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(
  message: string,
  status = 400,
  code?: string,
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: message, code, details },
    { status }
  )
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error("API Error:", error)

  if (error instanceof ZodError) {
    const details = error.flatten().fieldErrors as Record<string, string[]>
    return errorResponse("Validation failed", 400, "VALIDATION_ERROR", details)
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "An unexpected error occurred"
    return errorResponse(message, 500, "INTERNAL_ERROR")
  }

  return errorResponse("An unexpected error occurred", 500, "UNKNOWN_ERROR")
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 401, "UNAUTHORIZED")
}

export function forbiddenResponse(message = "Forbidden"): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 403, "FORBIDDEN")
}

export function notFoundResponse(message = "Not found"): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 404, "NOT_FOUND")
}
