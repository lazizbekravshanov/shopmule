"use client"

import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = () => {
    // Navigate to the signout page which handles the full signout flow
    router.push('/signout')
  }

  return (
    <Button onClick={handleSignOut} variant="outline" size="sm" className="gap-2">
      <LogOut className="w-4 h-4" />
      Sign Out
    </Button>
  )
}
