"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export type UserRole = "SUPER_ADMIN" | "SCHOOL_ADMIN"

const USER_ROLES: UserRole[] = ["SUPER_ADMIN", "SCHOOL_ADMIN"]

export const SUPER_ADMIN_ONLY_PATHS = [
  "/dashboard/school",
  "/dashboard/users",
  "/dashboard/super-admin",
] as const

export const SCHOOL_ADMIN_ONLY_PATHS = [
  "/dashboard/Student",
  "/dashboard/Teacher",
  "/dashboard/Branch",
  "/dashboard/Level",
  "/dashboard/Report",
  "/dashboard/school-admin",
  "/dashboard/school-admin-settings",
] as const

const RESTRICTED_ACCESS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [...SCHOOL_ADMIN_ONLY_PATHS],
  SCHOOL_ADMIN: [...SUPER_ADMIN_ONLY_PATHS],
}

export function useUserRoleAccess() {
  const { user, checkPermission, isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const userRole = user?.user_type as UserRole | undefined
  const isSuperAdmin = checkPermission("SUPER_ADMIN")
  const isSchoolAdmin = checkPermission("SCHOOL_ADMIN")

  const canAccessPath = (path: string): boolean => {
    if (!userRole) return false
    const restrictedPaths = RESTRICTED_ACCESS[userRole] || []
    return !restrictedPaths.some((restricted) => path.startsWith(restricted))
  }

  const getUserDashboardPath = (): string => {
    if (isSuperAdmin) return "/dashboard/super-admin"
    if (isSchoolAdmin) return "/dashboard/school-admin"
    return "/login"
  }

  return {
    user,
    userRole,
    isSuperAdmin,
    isSchoolAdmin,
    isAuthenticated,
    isLoading,
    canAccessPath,
    getUserDashboardPath,
    checkPermission,
  }
}