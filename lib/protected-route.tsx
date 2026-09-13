"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AUTH_TOKEN_KEY } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes?: ("SUPER_ADMIN" | "SCHOOL_ADMIN")[]
}

export function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated && user && allowedUserTypes) {
      if (!allowedUserTypes.includes(user.user_type)) {
        if (user.user_type === "SUPER_ADMIN") {
          router.push("/dashboard/super-admin")
        } else if (user.user_type === "SCHOOL_ADMIN") {
          router.push("/dashboard/school-admin")
        }
      }
    }
  }, [isAuthenticated, isLoading, router, user, allowedUserTypes, pathname])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen" suppressHydrationWarning>
        <div className="h-14 border-b" suppressHydrationWarning>
          <div className="flex items-center h-full px-4" suppressHydrationWarning>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-48 ml-4" />
          </div>
        </div>
        <div className="flex flex-1" suppressHydrationWarning>
          <div className="hidden lg:flex w-64 border-r p-4 flex-col gap-3" suppressHydrationWarning>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex-1 p-6 space-y-4" suppressHydrationWarning>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5" suppressHydrationWarning>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-6" suppressHydrationWarning>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type)) {
    return (
      <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}