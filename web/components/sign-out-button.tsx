"use client"

import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <Button onClick={handleSignOut} variant="outline" size="sm">
      Sign Out
    </Button>
  )
}
