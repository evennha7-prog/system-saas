"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { LevelTable } from "./level-table"
import { useAuth } from "@/lib/auth-context"
import {
  AUTH_TOKEN_KEY,
  ApiLevel,
  LevelPayload,
  createLevel,
  deleteLevel,
  getLevels,
  updateLevel,
} from "@/lib/api"

export type Level = {
  id: string
  school_id: string
  name: string
  description?: string
  display_order: number
  status: "active" | "inactive"
  createdAt: string
}

export default function LevelPage() {
  const { user } = useAuth()
  const [levels, setLevels] = React.useState<Level[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadLevels = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
      const response = await getLevels(token)
      if (!response || !response.data) {
        throw new Error("Invalid response from server")
      }
      setLevels(response.data.map((l: ApiLevel) => ({
        id: String(l.id),
        school_id: l.school_id != null ? String(l.school_id) : "",
        name: l.name,
        description: l.description,
        display_order: l.display_order,
        status: l.status,
        createdAt: l.created_at ?? new Date().toISOString().split("T")[0],
      })))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load levels"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadLevels()
  }, [loadLevels])

  const requireToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      throw new Error("Please login first")
    }
    return token
  }

  const handleCreate = async (payload: LevelPayload) => {
    const token = requireToken()
    await createLevel(token, payload)
    await loadLevels()
  }

  const handleUpdate = async (id: number, payload: Partial<LevelPayload>) => {
    const token = requireToken()
    await updateLevel(token, id, payload)
    await loadLevels()
  }

  const handleDelete = async (id: number) => {
    const token = requireToken()
    await deleteLevel(token, id)
    await loadLevels()
  }

  const isAuthorized = user?.user_type === "SCHOOL_ADMIN" || user?.user_type === "SUPER_ADMIN"

return (
     <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
       <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
         <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
           <div className="px-3 lg:px-4">
              <LevelTable
                       data={levels}
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
