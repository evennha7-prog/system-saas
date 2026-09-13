"use client"

export const dynamic = "force-dynamic"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { SectionCards } from "@/components/section-cards"
import { CollapsibleSection } from "@/components/collapsible-section"
import { StudentTable } from "./Student/student-table"
import { TeacherTable } from "./Teacher/teacher-table"
import { ReportTable } from "./Report/report-table"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { useDashboardApi } from "@/hooks/use-dashboard-api"
import { IconUser, IconUsers, IconReport, IconAlertTriangle } from "@tabler/icons-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function Page() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { branches, levels, teachers, students, error } = useDashboardApi()

  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.user_type === "SUPER_ADMIN") {
        router.replace("/dashboard/super-admin")
      } else if (user.user_type === "SCHOOL_ADMIN") {
        router.replace("/dashboard/school-admin")
      }
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!user) return null

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <Alert variant="destructive" className="w-full">
            <IconAlertTriangle className="h-5 w-5" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
      <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-3 lg:px-4 flex flex-col gap-4">
            <CollapsibleSection
              title="Student"
              icon={<IconUser className="h-5 w-5 text-green-500" />}
              count={students.length}
              defaultOpen
            >
              <StudentTable data={students} branchOptions={branches} levelOptions={levels.map((l) => ({ id: l.id, name: l.name }))} readOnly />
            </CollapsibleSection>
            <CollapsibleSection
              title="Teacher"
              icon={<IconUsers className="h-5 w-5 text-yellow-500" />}
              count={teachers.length}
              defaultOpen
            >
              <TeacherTable data={teachers} branchOptions={branches} />
            </CollapsibleSection>
            <CollapsibleSection
              title="Report"
              icon={<IconReport className="h-5 w-5 text-red-500" />}
              count={0}
              defaultOpen
            >
              <ReportTable
                data={[]}
                branchOptions={branches}
                teacherOptions={teachers.map((t) => ({ id: t.id, name: t.enname || t.khname || t.id }))}
                studentOptions={students.map((s) => ({ id: s.id, name: s.enname || s.khname || s.id }))}
              />
            </CollapsibleSection>
          </div>
        </div>
      </div>
  )
}
