"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { ReportTable } from "./report-table"
import { Report } from "./columns"
import { useDashboardApi } from "@/hooks/use-dashboard-api"
import { useAuth } from "@/lib/auth-context"
import {
  AUTH_TOKEN_KEY,
  type ApiReport,
  type ReportPayload,
  getReports,
  createReport,
  updateReport,
  deleteReport,
} from "@/lib/api"

function toUiReport(r: ApiReport): Report {
  return {
    id: String(r.id),
    title: r.title,
    type: r.type,
    branchId: String(r.branch_id ?? ""),
    teacherId: String(r.teacher_id ?? ""),
    studentId: String(r.student_id ?? ""),
    score: r.score ?? 0,
    date: r.date,
    schoolId: String(r.school_id),
    status: r.status,
    description: r.description,
    notes: r.notes,
  }
}

export default function ReportPage() {
  const { user } = useAuth()
  const { branches, teachers, students } = useDashboardApi()
  const [reports, setReports] = React.useState<Report[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadReports = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
      const response = await getReports(token)
      if (!response?.data) throw new Error("Invalid response from server")
      setReports(response.data.map(toUiReport))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load reports"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor")
    if (savedColor) {
      const colorToOKLCH: Record<string, string> = {
        "#0363ff": "oklch(0.527 0.154 150.069)",
        "#10b981": "oklch(0.545 0.179 162.275)",
        "#ffa200": "oklch(0.75 0.150 45.605)",
        "#ef4444": "oklch(0.577 0.245 27.325)",
        "#8b5cf6": "oklch(0.608 0.249 291.276)",
      }
      const oklchColor = colorToOKLCH[savedColor] || savedColor
      document.documentElement.style.setProperty("--primary", oklchColor)
      document.documentElement.style.setProperty("--accent", oklchColor)
      document.documentElement.style.setProperty("--ring", oklchColor)
    }
    loadReports()
  }, [loadReports])

  const requireToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      throw new Error("Please login first")
    }
    return token
  }

  const handleCreate = async (payload: ReportPayload) => {
    const token = requireToken()
    await createReport(token, payload)
    await loadReports()
  }

  const handleUpdate = async (id: number, payload: Partial<ReportPayload>) => {
    const token = requireToken()
    await updateReport(token, id, payload)
    await loadReports()
  }

  const handleDelete = async (id: number) => {
    const token = requireToken()
    await deleteReport(token, id)
    await loadReports()
  }

  const isAuthorized = user?.user_type === "SCHOOL_ADMIN" || user?.user_type === "SUPER_ADMIN"

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6" suppressHydrationWarning>
                <div className="px-3 lg:px-4" suppressHydrationWarning>
                   <ReportTable
                     data={reports}
                     isLoading={isLoading}
                     error={error}
                     readOnly={!isAuthorized}
                     branchOptions={branches}
                     teacherOptions={teachers.map((t) => ({ id: t.id, name: t.enname || t.khname || t.id }))}
                     studentOptions={students.map((s) => ({ id: s.id, name: s.enname || s.khname || s.id }))}
                     onCreate={handleCreate}
                     onUpdate={handleUpdate}
                     onDelete={handleDelete}
                     hideDelete={true}
                   />
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
