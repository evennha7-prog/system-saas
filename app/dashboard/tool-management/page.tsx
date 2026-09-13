"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentTable } from "@/app/dashboard/Student/student-table"
import { Student } from "@/app/dashboard/Student/columns"
import { TeacherTable } from "@/app/dashboard/Teacher/teacher-table"
import { Teacher } from "@/app/dashboard/Teacher/columns"
import { LevelTable } from "@/app/dashboard/Level/level-table"
import { Level } from "@/app/dashboard/Level/columns"
import { BranchTable } from "@/app/dashboard/Branch/branch-table"
import { Branch } from "@/app/dashboard/Branch/columns"
import { ReportTable } from "@/app/dashboard/Report/report-table"
import { Report } from "@/app/dashboard/Report/columns"
import { SchoolTable } from "@/app/dashboard/super-admin/school-table"
import { School } from "@/app/dashboard/super-admin/school-columns"
import { AdminTable } from "@/app/dashboard/users/admin-table"
import { PendingApprovals } from "./pending-approvals"

import {
  AUTH_TOKEN_KEY,
  ApiStudent,
  ApiLevel,
  ApiBranch,
  ApiReport,
  ApiSchool,
  StudentPayload,
  LevelPayload,
  BranchPayload,
  ReportPayload,
  SchoolPayload,
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
  createLevel,
  deleteLevel,
  getLevels,
  updateLevel,
  createBranch,
  deleteBranch,
  getBranches,
  updateBranch,
  createReport,
  deleteReport,
  getReports,
  updateReport,
  createSchool,
  deleteSchool,
  getSchools,
  updateSchool,
  updateSchoolProfile,
  ApiEmployee,
  EmployeePayload,
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useSearchParams } from "next/navigation"

function toUiStudent(student: ApiStudent): Student {
  return {
    id: String(student.id),
    user_id: String(student.user_id ?? ""),
    tenant_id: student.tenant_id ?? "",
    school_id: student.school_id != null ? String(student.school_id) : "",
    photo: student.photo ?? "",
    studentcode: student.studentcode,
    enname: student.enname,
    khname: student.khname,
    zhname: student.zhname ?? "",
    gender: student.gender,
    date_of_birth: student.date_of_birth,
    nationality: student.nationality,
    religion: student.religion ?? "",
    pob_province: student.pob_province ?? "",
    pob_district: student.pob_district ?? "",
    pob_commune: student.pob_commune ?? "",
    pob_village: student.pob_village ?? "",
    cur_province: student.cur_province ?? "",
    cur_district: student.cur_district ?? "",
    cur_commune: student.cur_commune ?? "",
    cur_village: student.cur_village ?? "",
    joinschool: student.joinschool,
    leftschool: student.leftschool ?? "",
    branchId: student.branch_id ? String(student.branch_id) : "",
    levelId: "",
    status: student.status === "ACTIVE" ? "active" : "inactive",
    createdAt: student.updated_at?.split("T")[0] ?? "",
  }
}

function toUiEmployee(employee: ApiEmployee): Teacher {
  return {
    id: String(employee.id),
    user_id: String(employee.user_id),
    tenant_id: String(employee.tenant_id),
    school_id: employee.school_id != null ? String(employee.school_id) : "",
    photo: employee.photo ?? "",
    teachercode: employee.teachercode,
    enname: employee.enname,
    khname: employee.khname,
    zhname: employee.zhname ?? "",
    gender: employee.gender,
    date_of_birth: employee.date_of_birth,
    nationality: employee.nationality,
    religion: employee.religion ?? "",
    pob_province: employee.pob_province ?? "",
    pob_district: employee.pob_district ?? "",
    pob_commune: employee.pob_commune ?? "",
    pob_village: employee.pob_village ?? "",
    cur_province: employee.cur_province ?? "",
    cur_district: employee.cur_district ?? "",
    cur_commune: employee.cur_commune ?? "",
    cur_village: employee.cur_village ?? "",
    joinwork: employee.joinwork ?? "",
    leftwork: employee.leftwork ?? "",
    branchId: String(employee.branch_id),
    subject: "",
    status: employee.is_active ? "active" : "inactive",
    createdAt: employee.created_at ?? "",
  }
}

function toUiLevel(l: ApiLevel): Level {
  return {
    id: String(l.id),
    school_id: l.school_id != null ? String(l.school_id) : "",
    name: l.name,
    description: l.description,
    display_order: l.display_order,
    status: l.status,
    createdAt: l.created_at ?? new Date().toISOString().split("T")[0],
  }
}

function toUiBranch(b: ApiBranch): Branch {
  return {
    id: String(b.id),
    tenant_id: b.tenant_id,
    khname: b.khname,
    enname: b.enname,
    zhname: b.zhname,
    school_id: b.school_id != null ? String(b.school_id) : "",
    student_code_prefix: b.student_code_prefix ?? "",
    student_code_suffix: b.student_code_suffix ?? "",
    student_code_digit: String(b.student_code_digit ?? ""),
    status: b.status ?? "active",
    createdAt: b.created_at ?? new Date().toISOString().split("T")[0],
  }
}

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

function toUiSchool(s: ApiSchool): School {
  return {
    id: String(s.id),
    tenant_id: s.tenant_id ?? "",
    user_id: String(s.user_id ?? ""),
    khname: s.khname ?? "",
    enname: s.enname ?? "",
    zhname: s.zhname ?? "",
    student_code_prefix: s.student_code_prefix ?? "",
    student_code_suffix: s.student_code_suffix ?? "",
    student_code_digit: String(s.student_code_digit ?? ""),
    short_school: s.short_school ?? "",
    createdAt: s.created_at ? s.created_at.split("T")[0] : "",
  }
}

export default function ToolManagementPage() {
  const { user } = useAuth()
  const isSchoolAdmin = user?.user_type === "SCHOOL_ADMIN"
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = React.useState(searchParams.get("tab") || "students")

  const [students, setStudents] = React.useState<Student[]>([])
  const [teachers, setTeachers] = React.useState<Teacher[]>([])
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [levels, setLevels] = React.useState<Level[]>([])
  const [reports, setReports] = React.useState<Report[]>([])
  const [schools, setSchools] = React.useState<School[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
      const [studentsRes, teachersRes, branchesRes, levelsRes, reportsRes, schoolsRes] = await Promise.all([
        getStudents(token),
        getEmployees(token),
        getBranches(token),
        getLevels(token),
        getReports(token),
        getSchools(token),
      ])
      if (studentsRes?.data) setStudents(studentsRes.data.map(toUiStudent))
      if (teachersRes?.data) setTeachers(teachersRes.data.map(toUiEmployee))
      if (branchesRes?.data) setBranches(branchesRes.data.map(toUiBranch))
      if (levelsRes?.data) setLevels(levelsRes.data.map(toUiLevel))
      if (reportsRes?.data) setReports(reportsRes.data.map(toUiReport))
      if (schoolsRes?.data) setSchools(schoolsRes.data.map(toUiSchool))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    void loadData()
  }, [loadData])

  const requireToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) throw new Error("Please login first")
    return token
  }

  const handleCreateStudent = async (payload: StudentPayload) => {
    const token = requireToken()
    await createStudent(token, payload)
    await loadData()
  }

  const handleUpdateStudent = async (id: number, payload: Partial<StudentPayload>) => {
    const token = requireToken()
    await updateStudent(token, id, payload)
    await loadData()
  }

  const handleDeleteStudent = async (id: number) => {
    const token = requireToken()
    await deleteStudent(token, id)
    await loadData()
  }

  const handleCreateTeacher = async (payload: EmployeePayload) => {
    const token = requireToken()
    await createEmployee(token, payload)
    await loadData()
  }

  const handleUpdateTeacher = async (id: number, payload: Partial<EmployeePayload>) => {
    const token = requireToken()
    await updateEmployee(token, id, payload)
    await loadData()
  }

  const handleDeleteTeacher = async (id: number) => {
    const token = requireToken()
    await deleteEmployee(token, id)
    await loadData()
  }

  const handleCreateLevel = async (payload: LevelPayload) => {
    const token = requireToken()
    await createLevel(token, payload)
    await loadData()
  }

  const handleUpdateLevel = async (id: number, payload: Partial<LevelPayload>) => {
    const token = requireToken()
    await updateLevel(token, id, payload)
    await loadData()
  }

  const handleDeleteLevel = async (id: number) => {
    const token = requireToken()
    await deleteLevel(token, id)
    await loadData()
  }

  const handleCreateBranch = async (payload: BranchPayload) => {
    const token = requireToken()
    await createBranch(token, payload)
    await loadData()
  }

  const handleUpdateBranch = async (id: number, payload: Partial<BranchPayload>) => {
    const token = requireToken()
    await updateBranch(token, id, payload)
    await loadData()
  }

  const handleDeleteBranch = async (id: number) => {
    const token = requireToken()
    await deleteBranch(token, id)
    await loadData()
  }

  const handleCreateReport = async (payload: ReportPayload) => {
    const token = requireToken()
    await createReport(token, payload)
    await loadData()
  }

  const handleUpdateReport = async (id: number, payload: Partial<ReportPayload>) => {
    const token = requireToken()
    await updateReport(token, id, payload)
    await loadData()
  }

  const handleDeleteReport = async (id: number) => {
    const token = requireToken()
    await deleteReport(token, id)
    await loadData()
  }

  const handleCreateSchool = async (payload: SchoolPayload) => {
    const token = requireToken()
    await createSchool(token, payload)
    await loadData()
  }

  const handleUpdateSchool = async (id: number, payload: Partial<SchoolPayload>) => {
    const token = requireToken()
    if (isSchoolAdmin) {
      await updateSchoolProfile(token, payload)
    } else {
      await updateSchool(token, id, payload)
    }
    await loadData()
  }

  const handleDeleteSchool = async (id: number) => {
    const token = requireToken()
    await deleteSchool(token, id)
    await loadData()
  }

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-3 lg:px-4">
                  <h1 className="text-2xl font-bold">Tool Management</h1>
                  <p className="text-muted-foreground">Manage students, teachers, and system tools</p>

                  <div className="mt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="overflow-x-auto pb-1">
                          <TabsList className="inline-flex w-max">
                            <TabsTrigger value="students">Students</TabsTrigger>
                            <TabsTrigger value="teachers">Teachers</TabsTrigger>
                            <TabsTrigger value="levels">Level</TabsTrigger>
                            <TabsTrigger value="branches">Branch</TabsTrigger>
                            <TabsTrigger value="schools">School</TabsTrigger>
                            <TabsTrigger value="reports">Report</TabsTrigger>
                            {!isSchoolAdmin && (
                              <>
                                <span className="w-px mx-2 bg-border self-stretch" />
                                <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
                                <TabsTrigger value="users">User Management</TabsTrigger>
                              </>
                            )}
                          </TabsList>
                        </div>

                      <TabsContent value="students" className="mt-4">
                        <StudentTable
                          data={students}
                          branchOptions={branches}
                          levelOptions={levels}
                          isLoading={isLoading}
                          error={error}
                          hideAddButton={true}
                          onCreate={handleCreateStudent}
                          onUpdate={handleUpdateStudent}
                          onDelete={handleDeleteStudent}
                        />
                      </TabsContent>

                      <TabsContent value="teachers" className="mt-4">
                        <TeacherTable
                          data={teachers}
                          branchOptions={branches}
                          isLoading={isLoading}
                          error={error}
                          hideAddButton={true}
                          onCreate={handleCreateTeacher}
                          onUpdate={handleUpdateTeacher}
                          onDelete={handleDeleteTeacher}
                        />
                      </TabsContent>

                      <TabsContent value="levels" className="mt-4">
                        <LevelTable
                          data={levels}
                          isLoading={isLoading}
                          error={error}
                          hideAddButton={true}
                          onCreate={handleCreateLevel}
                          onUpdate={handleUpdateLevel}
                          onDelete={handleDeleteLevel}
                        />
                      </TabsContent>

                      <TabsContent value="branches" className="mt-4">
                        <BranchTable
                          data={branches}
                          isLoading={isLoading}
                          error={error}
                          hideAddButton={true}
                          onCreate={handleCreateBranch}
                          onUpdate={handleUpdateBranch}
                          onDelete={handleDeleteBranch}
                        />
                      </TabsContent>

                      <TabsContent value="schools" className="mt-4">
                        <SchoolTable
                          data={schools}
                          isLoading={isLoading}
                          error={error}
                          onCreate={handleCreateSchool}
                          onUpdate={handleUpdateSchool}
                        />
                      </TabsContent>

                      <TabsContent value="reports" className="mt-4">
                        <ReportTable
                          data={reports}
                          branchOptions={branches}
                          isLoading={isLoading}
                          error={error}
                          onCreate={handleCreateReport}
                          onUpdate={handleUpdateReport}
                          onDelete={handleDeleteReport}
                        />
                      </TabsContent>

                      {!isSchoolAdmin && (
                        <TabsContent value="approvals" className="mt-4">
                          <PendingApprovals />
                        </TabsContent>
                      )}
                      {!isSchoolAdmin && (
                        <TabsContent value="users" className="mt-4">
                          <AdminTable />
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
