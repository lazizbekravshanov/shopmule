import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error("Invalid environment variables:")
    console.error(parsed.error.flatten().fieldErrors)

    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables")
    }

    // In development, return defaults for missing vars
    return {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://localhost:5432/shopmule",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "development-secret-key-at-least-32-chars",
      NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
    }
  }

  return parsed.data
}

export const env = validateEnv()

export const isDev = env.NODE_ENV === "development"
export const isProd = env.NODE_ENV === "production"
export const isTest = env.NODE_ENV === "test"
