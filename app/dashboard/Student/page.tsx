"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { StudentTable } from "./student-table"
import { Student } from "./columns"
import type { Branch } from "@/app/dashboard/Branch/columns"
import { useAuth } from "@/lib/auth-context"
import {
  AUTH_TOKEN_KEY,
  ApiStudent,
  StudentPayload,
  createStudent,
  deleteStudent,
  getStudents,
  getBranches,
  getLevels,
  updateStudent,
} from "@/lib/api"

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
    levelId: student.level_id ? String(student.level_id) : "",
    father_name: student.father_name ?? "",
    father_phone: student.father_phone ?? "",
    mother_name: student.mother_name ?? "",
    mother_phone: student.mother_phone ?? "",
    status: student.status === "ACTIVE" ? "active" : "inactive",
    createdAt: student.updated_at?.split("T")[0] ?? "",
  }
}

export default function StudentPage() {
  const { user } = useAuth()
  const [students, setStudents] = React.useState<Student[]>([])
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [levels, setLevels] = React.useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
      const [studentsRes, branchesRes, levelsRes] = await Promise.all([
        getStudents(token),
        getBranches(token),
        getLevels(token),
      ])
      if (!studentsRes?.data) {
        throw new Error("Invalid response from server")
      }
      setStudents(studentsRes.data.map(toUiStudent))
      setBranches(branchesRes?.data?.map((b) => ({
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
        createdAt: b.created_at ?? "",
      })) ?? [])
      setLevels(levelsRes?.data?.map((l) => ({
        id: String(l.id),
        name: l.name,
      })) ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load data"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor")
    if (savedColor) {
      const colorToOKLCH: Record<string, string> = {
        "#3b82f6": "oklch(0.527 0.154 150.069)",
        "#10b981": "oklch(0.545 0.179 162.275)",
        "#f59e0b": "oklch(0.75 0.150 45.605)",
        "#ef4444": "oklch(0.577 0.245 27.325)",
        "#8b5cf6": "oklch(0.608 0.249 291.276)",
      }
      const oklchColor = colorToOKLCH[savedColor] || savedColor
      document.documentElement.style.setProperty("--primary", oklchColor)
      document.documentElement.style.setProperty("--accent", oklchColor)
      document.documentElement.style.setProperty("--ring", oklchColor)
    }
    void loadData()
  }, [loadData])

  const requireToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      throw new Error("Please login first")
    }
    return token
  }

  const handleCreate = async (payload: StudentPayload) => {
    const token = requireToken()
    await createStudent(token, payload)
    await loadData()
  }

  const handleUpdate = async (id: number, payload: Partial<StudentPayload>) => {
    const token = requireToken()
    await updateStudent(token, id, payload)
    await loadData()
  }

  const handleDelete = async (id: number) => {
    const token = requireToken()
    await deleteStudent(token, id)
    await loadData()
  }

  const isAuthorized = user?.user_type === "SCHOOL_ADMIN" || user?.user_type === "SUPER_ADMIN"

return (
     <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
       <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
         <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
           <div className="px-3 lg:px-4">
               <StudentTable
                       data={students}
                       branchOptions={branches}
                       levelOptions={levels}
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
