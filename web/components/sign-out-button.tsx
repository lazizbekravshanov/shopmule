"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

export function SignOutButton() {
  const router = useRouter()
  
  const handleSignOut = async () => {
    try {
      // Clear the session and cookies
      await signOut({ 
        callbackUrl: "/login",
        redirect: true 
      })
      // Force a hard refresh to clear any cached data
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
      // Fallback: redirect to login even if signOut fails
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <Button onClick={handleSignOut} variant="outline" size="sm">
      Sign Out
    </Button>
  )
}
