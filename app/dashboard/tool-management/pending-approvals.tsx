"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AUTH_TOKEN_KEY, getUsers, approveUser, rejectUser, getSchools } from "@/lib/api"
import { toast } from "sonner"
import { IconCheck, IconX, IconRefresh, IconUserPlus } from "@tabler/icons-react"

type PendingUser = {
  id: string
  email: string
  username: string
  phonenumber: string
  created_at: string
  schoolName?: string
}

export function PendingApprovals() {
  const [users, setUsers] = React.useState<PendingUser[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  const fetchPending = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) return
      
      const [usersRes, schoolsRes] = await Promise.all([
        getUsers(token),
        getSchools(token).catch(() => ({ data: [] }))
      ])

      const schoolsData = schoolsRes?.data || []

      if (usersRes?.data) {
        setUsers(
          usersRes.data
            .filter((u) => u.status === "PENDING")
            .map((u) => {
              const userSchool = schoolsData.find((s: any) => s.tenant_id === u.tenant_id || String(s.user_id) === String(u.id))
              return {
                id: String(u.id),
                email: u.email,
                username: u.username || "",
                phonenumber: u.phonenumber || "",
                created_at: u.created_at || "",
                schoolName: userSchool?.enname || userSchool?.khname || "No School Name"
              }
            })
        )
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) return
      await approveUser(token, Number(userId))
      toast.success("User approved successfully")
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve user")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      setActionLoading(userId)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) return
      await rejectUser(token, Number(userId))
      toast.success("User rejected")
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject user")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {users.length} pending approval
        </div>
        <Button variant="outline" size="sm" onClick={fetchPending} disabled={isLoading}>
          <IconRefresh className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="inline-flex size-12 items-center justify-center rounded-full bg-muted">
              <IconUserPlus className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No pending approvals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{user.username || user.email}</span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>
                  </div>
                  <p className="text-sm font-semibold text-primary truncate">School: {user.schoolName}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {user.phonenumber && (
                    <p className="text-xs text-muted-foreground">{user.phonenumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Registered: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    <IconCheck className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleReject(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    <IconX className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
