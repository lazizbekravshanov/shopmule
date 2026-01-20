import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-8xl font-light text-gray-200 mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page not found
        </h2>

        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="default">
              <Home className="w-4 h-4 mr-2" />
              Go home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              Go to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
