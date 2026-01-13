import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NavBar } from "@/components/dashboard/navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar 
        userName={session.user.name} 
        userEmail={session.user.email} 
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-16">
        {children}
      </main>
    </div>
  )
}
