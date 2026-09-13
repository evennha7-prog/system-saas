"use client"

import * as React from "react"
import { getBranches, getEmployees, getLevels, getStudents, AUTH_TOKEN_KEY } from "@/lib/api"
import type { Student } from "@/app/dashboard/Student/columns"
import type { Teacher } from "@/app/dashboard/Teacher/columns"
import type { Level } from "@/app/dashboard/Level/columns"
import type { Branch } from "@/app/dashboard/Branch/columns"

export type DashboardApiData = {
  branches: Branch[]
  levels: Level[]
  teachers: Teacher[]
  students: Student[]
}

export function useDashboardApi() {
  const [data, setData] = React.useState<DashboardApiData>({
    branches: [],
    levels: [],
    teachers: [],
    students: [],
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
        const [branchesRes, levelsRes, teachersRes, studentsRes] = await Promise.all([
          getBranches(token).catch((e) => { throw new Error(`Failed to load branches: ${e.message}`) }),
          getLevels(token).catch((e) => { throw new Error(`Failed to load levels: ${e.message}`) }),
          getEmployees(token).catch((e) => { throw new Error(`Failed to load teachers: ${e.message}`) }),
          getStudents(token).catch((e) => { throw new Error(`Failed to load students: ${e.message}`) }),
        ])
        if (!active) return
        setData({
          branches: branchesRes.data.map((b) => ({
            id: String(b.id),
            tenant_id: b.tenant_id,
            khname: b.khname,
            enname: b.enname,
            zhname: b.zhname,
            school_id: b.school_id != null ? String(b.school_id) : "",
            student_code_prefix: b.student_code_prefix ?? "",
            student_code_suffix: b.student_code_suffix ?? "",
            student_code_digit: String(b.student_code_digit ?? 0),
            status: b.status ?? "active",
            createdAt: b.created_at?.split("T")[0] ?? "",
          })),
          levels: levelsRes.data.map((l) => ({
            id: String(l.id),
            school_id: l.school_id != null ? String(l.school_id) : "",
            name: l.name,
            description: l.description,
            display_order: l.display_order,
            status: l.status,
            createdAt: l.created_at?.split("T")[0] ?? "",
          })),
          teachers: teachersRes.data.map((t) => ({
            id: String(t.id),
            user_id: String(t.user_id),
            tenant_id: String(t.tenant_id),
            school_id: t.school_id != null ? String(t.school_id) : "",
            photo: t.photo ?? "",
            teachercode: t.teachercode,
            enname: t.enname,
            khname: t.khname,
            zhname: t.zhname ?? "",
            gender: t.gender,
            date_of_birth: t.date_of_birth,
            nationality: t.nationality,
            religion: t.religion ?? "",
            pob_province: t.pob_province ?? "",
            pob_district: t.pob_district ?? "",
            pob_commune: t.pob_commune ?? "",
            pob_village: t.pob_village ?? "",
            cur_province: t.cur_province ?? "",
            cur_district: t.cur_district ?? "",
            cur_commune: t.cur_commune ?? "",
            cur_village: t.cur_village ?? "",
            joinwork: t.joinwork ?? "",
            leftwork: t.leftwork ?? "",
            branchId: String(t.branch_id),
            subject: "",
            status: t.is_active ? "active" : "inactive",
            createdAt: t.created_at ?? "",
          })),
          students: studentsRes.data.map((s) => ({
            id: String(s.id),
            user_id: String(s.user_id ?? ""),
            tenant_id: String(s.tenant_id),
            school_id: s.school_id != null ? String(s.school_id) : "",
            photo: s.photo ?? "",
            studentcode: s.studentcode,
            enname: s.enname,
            khname: s.khname,
            zhname: s.zhname ?? "",
            gender: s.gender,
            date_of_birth: s.date_of_birth,
            nationality: s.nationality,
            religion: s.religion ?? "",
            pob_province: s.pob_province ?? "",
            pob_district: s.pob_district ?? "",
            pob_commune: s.pob_commune ?? "",
            pob_village: s.pob_village ?? "",
            cur_province: s.cur_province ?? "",
            cur_district: s.cur_district ?? "",
            cur_commune: s.cur_commune ?? "",
            cur_village: s.cur_village ?? "",
            joinschool: s.joinschool ?? "",
            leftschool: s.leftschool ?? "",
            branchId: String(s.branch_id),
            levelId: "",
            status: s.status === "ACTIVE" ? "active" : "inactive",
            createdAt: s.updated_at?.split("T")[0] ?? "",
          })),
        })
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : "An unknown error occurred"
        setError(message)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  return { ...data, isLoading, error }
}
