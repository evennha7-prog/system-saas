"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardApi } from "@/hooks/use-dashboard-api"

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

export function ReportStudentCards() {
  const { students } = useDashboardApi()
  return (
    <div className="grid grid-cols-1 gap-4 px-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-4">
      <StatCard title="Student Reports" value={0} />
      <StatCard title="Published" value={0} />
      <StatCard title="Pending Review" value={0} />
      <StatCard title="Total Students" value={students.length} />
    </div>
  )
}

export function ReportEmployeeCards() {
  const { teachers } = useDashboardApi()
  return (
    <div className="grid grid-cols-1 gap-4 px-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-4">
      <StatCard title="Employee Reports" value={0} />
      <StatCard title="Published Reports" value={0} />
      <StatCard title="Pending Review" value={0} />
      <StatCard title="Total Teachers" value={teachers.length} />
    </div>
  )
}

export function ReportLevelCards() {
  const { levels } = useDashboardApi()
  const activeLevels = levels.filter((l) => l.status === "active").length
  return (
    <div className="grid grid-cols-1 gap-4 px-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-3">
      <StatCard title="Total Levels" value={levels.length} />
      <StatCard title="Active Levels" value={activeLevels} />
      <StatCard title="Reports by Level" value={0} />
    </div>
  )
}
