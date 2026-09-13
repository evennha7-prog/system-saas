"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { ReportEmployeeCards } from "@/components/report-cards"
import { ReportTable } from "../Report/report-table"
import { Report } from "../Report/columns"
import { useDashboardApi } from "@/hooks/use-dashboard-api"
import {
  AUTH_TOKEN_KEY,
  type ApiReport,
  getReports,
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
  }
}

export default function ReportEmployeePage() {
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
      setError(err instanceof Error ? err.message : "Failed to load reports")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadReports()
  }, [loadReports])

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-3 lg:px-4">
                  <h1 className="text-2xl font-bold tracking-tight mb-4">Employee Reports</h1>
                  <ReportEmployeeCards />
                </div>
                <div className="px-3 lg:px-4">
                  <h2 className="text-xl font-semibold tracking-tight mb-4">All Employee Reports</h2>
                  <ReportTable
                    data={reports}
                    isLoading={isLoading}
                    error={error}
                    readOnly
                    branchOptions={branches}
                    teacherOptions={teachers.map((t: { id: string; enname?: string; khname?: string }) => ({ id: t.id, name: t.enname || t.khname || t.id }))}
                    studentOptions={students.map((s: { id: string; enname?: string; khname?: string }) => ({ id: s.id, name: s.enname || s.khname || s.id }))}
                  />
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
