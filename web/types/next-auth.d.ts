import { Role } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: Role
      tenantId: string | null
      shopId: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: Role
    tenantId?: string | null
    shopId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    tenantId?: string | null
    shopId?: string | null
  }
}
