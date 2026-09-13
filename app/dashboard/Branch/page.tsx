"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { BranchTable } from "./branch-table"
import { useAuth } from "@/lib/auth-context"
import {
  AUTH_TOKEN_KEY,
  ApiBranch,
  BranchPayload,
  createBranch,
  deleteBranch,
  getBranches,
  updateBranch,
} from "@/lib/api"

export type Branch = {
  id: string
  tenant_id?: string
  khname?: string
  enname?: string
  zhname?: string
  school_id?: string
  student_code_prefix: string
  student_code_suffix: string
  student_code_digit: string
  status: "active" | "inactive"
  createdAt: string
}

export default function BranchPage() {
  const { user } = useAuth()
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadBranches = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
      const response = await getBranches(token)
      if (!response || !response.data) {
        throw new Error("Invalid response from server")
      }
      setBranches(response.data.map((b: ApiBranch) => ({
        id: String(b.id),
        tenant_id: b.tenant_id,
        khname: b.khname,
        enname: b.enname,
        zhname: b.zhname,
        school_id: String(b.school_id),
        student_code_prefix: b.student_code_prefix ?? "",
        student_code_suffix: b.student_code_suffix ?? "",
        student_code_digit: String(b.student_code_digit ?? ""),
        status: b.status ?? "active",
        createdAt: b.created_at ?? new Date().toISOString().split("T")[0],
      })))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load branches"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadBranches()
  }, [loadBranches])

  const requireToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      throw new Error("Please login first")
    }
    return token
  }

  const handleCreate = async (payload: BranchPayload) => {
    const token = requireToken()
    await createBranch(token, payload)
    await loadBranches()
  }

  const handleUpdate = async (id: number, payload: Partial<BranchPayload>) => {
    const token = requireToken()
    await updateBranch(token, id, payload)
    await loadBranches()
  }

  const handleDelete = async (id: number) => {
    const token = requireToken()
    await deleteBranch(token, id)
    await loadBranches()
  }

  const isAuthorized = user?.user_type === "SCHOOL_ADMIN" || user?.user_type === "SUPER_ADMIN"

return (
     <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
       <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
         <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
           <div className="px-3 lg:px-4">
             <BranchTable
                      data={branches}
                      isLoading={isLoading}
                      error={error}
                      readOnly={!isAuthorized}
                      hideDelete={true}
                      onCreate={handleCreate}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
            </div>
          </div>
        </div>
      </ProtectedRoute>
   )
 }
