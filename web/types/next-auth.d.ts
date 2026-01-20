import { Role } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: Role
      shopId: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: Role
    shopId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    shopId: string
  }
}
