"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { TeacherTable } from "./teacher-table"
import { Teacher } from "./columns"
import type { Branch } from "@/app/dashboard/Branch/columns"
import { useAuth } from "@/lib/auth-context"
import {
  AUTH_TOKEN_KEY,
  ApiEmployee,
  EmployeePayload,
  createEmployee,
  deleteEmployee,
  getEmployees,
  getBranches,
  updateEmployee,
} from "@/lib/api"
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
    father_name: employee.father_name ?? "",
    father_phone: employee.father_phone ?? "",
    mother_name: employee.mother_name ?? "",
    mother_phone: employee.mother_phone ?? "",
    branchId: String(employee.branch_id),
    subject: "",
    status: employee.is_active ? "active" : "inactive",
    createdAt: employee.created_at ?? "",
  }
}

export default function TeacherPage() {
   const { user } = useAuth()
   const [teachers, setTeachers] = React.useState<Teacher[]>([])
   const [branches, setBranches] = React.useState<Branch[]>([])
   const [isLoading, setIsLoading] = React.useState(true)
   const [error, setError] = React.useState<string | null>(null)

   const loadData = React.useCallback(async () => {
     try {
       setIsLoading(true)
       setError(null)
       const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
       const [teachersRes, branchesRes] = await Promise.all([
         getEmployees(token),
         getBranches(token),
       ])
       if (!teachersRes?.data) {
         throw new Error("Invalid response from server")
       }
       setTeachers(teachersRes.data.map(toUiEmployee))
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
     } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to load data"
       setError(message)
     } finally {
       setIsLoading(false)
     }
   }, [])

   React.useEffect(() => {
     void loadData()
   }, [loadData])

   const requireToken = () => {
     const token = localStorage.getItem(AUTH_TOKEN_KEY)
     if (!token) {
       throw new Error("Please login first")
     }
     return token
   }

   const handleCreate = async (payload: EmployeePayload) => {
     const token = requireToken()
     await createEmployee(token, payload)
     await loadData()
   }

   const handleUpdate = async (id: number, payload: Partial<EmployeePayload>) => {
     const token = requireToken()
     await updateEmployee(token, id, payload)
     await loadData()
   }

   const handleDelete = async (id: number) => {
     const token = requireToken()
     await deleteEmployee(token, id)
     await loadData()
   }

   const isAuthorized = user?.user_type === "SCHOOL_ADMIN" || user?.user_type === "SUPER_ADMIN"

    return (
      <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
        <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-3 lg:px-4">
              <TeacherTable
                      data={teachers}
                      branchOptions={branches}
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
