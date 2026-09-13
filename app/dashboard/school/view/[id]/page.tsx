"use client"

import { ProtectedRoute } from "@/lib/protected-route"
import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"
import { useParams, useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AUTH_TOKEN_KEY,
  getSchool,
  getUsers,
  getBranches,
  getStudents,
  getEmployees,
  getLevels,
  getReports,
  createUserByAdmin,
  type ApiSchool,
  type ApiUser,
  type ApiBranch,
  type ApiStudent,
  type ApiEmployee,
  type ApiLevel,
  type ApiReport,
  getImageUrl,
} from "@/lib/api"
import {
  IconArrowLeft,
  IconSchool,
  IconUser,
  IconMail,
  IconPhone,
  IconBuildingSkyscraper,
  IconCalendar,
  IconId,
  IconShield,
  IconPlus,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconGitBranch,
  IconUsers,
  IconReport,
  IconStack,
  IconEye,
  IconFileSpreadsheet,
  IconBuilding,
  IconBook,
  IconCertificate2,
} from "@tabler/icons-react"
import * as XLSX from "xlsx"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

// ── Status badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    INACTIVE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  )
}

// ── Info card row ─────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="group flex items-start justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-muted/40 transition-all border-b border-border/40 last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0 group-hover:text-foreground transition-colors">{label}</span>
      <span className="text-sm font-medium text-right break-words flex-1 text-foreground/90 group-hover:text-foreground transition-colors">
        {value || <span className="text-muted-foreground/50 italic">—</span>}
      </span>
    </div>
  )
}

// ── Resizable Table Wrapper ──────────────────────────────
interface ResizableTableProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  columnsCount: number
  isLoading: boolean
  emptyMessage?: string
  onRowClick?: (row: TData) => void
}

function ResizableTable<TData>({
  table,
  columnsCount,
  isLoading,
  emptyMessage = "No data available.",
  onRowClick
}: ResizableTableProps<TData>) {
  return (
    <div className="rounded-lg border overflow-x-auto min-h-[200px] bg-background">
      <Table className="table-fixed" style={{ width: table.getCenterTotalSize(), minWidth: "100%" }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`relative border-r last:border-r-0 ${header.column.getCanSort() ? "cursor-pointer select-none hover:bg-muted/50" : ""}`}
                  style={{ width: header.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          {
                            asc: <IconArrowUp className="h-3.5 w-3.5 text-foreground shrink-0" />,
                            desc: <IconArrowDown className="h-3.5 w-3.5 text-foreground shrink-0" />,
                          }[header.column.getIsSorted() as string] ?? <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                        )}
                      </div>
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize user-select-none touch-none hover:bg-primary/50 transition-colors ${
                            header.column.getIsResizing() ? "bg-primary" : "bg-transparent"
                          }`}
                        />
                      )}
                    </>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnsCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnsCount} className="h-28 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow 
                key={row.id} 
                className={`hover:bg-muted/30 transition-colors ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className="border-r last:border-r-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function SchoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const schoolId = Number(params.id)
  const isSchoolAdmin = user?.user_type === "SCHOOL_ADMIN"

  const [school, setSchool] = React.useState<ApiSchool | null>(null)
  const [users, setUsers] = React.useState<ApiUser[]>([])
  const [branches, setBranches] = React.useState<ApiBranch[]>([])
  const [students, setStudents] = React.useState<ApiStudent[]>([])
  const [teachers, setTeachers] = React.useState<ApiEmployee[]>([])
  const [levels, setLevels] = React.useState<ApiLevel[]>([])
  const [reports, setReports] = React.useState<ApiReport[]>([])
  const [selectedStudent, setSelectedStudent] = React.useState<ApiStudent | null>(null)
  const [selectedTeacher, setSelectedTeacher] = React.useState<ApiEmployee | null>(null)
  const [exportType, setExportType] = React.useState<"students" | "teachers" | "users" | "branches" | "levels" | "reports" | null>(null)
  const [availableColumns, setAvailableColumns] = React.useState<{ id: string; label: string; checked: boolean }[]>([])

  const [sortingUsers, setSortingUsers] = React.useState<SortingState>([])
  const [sortingBranches, setSortingBranches] = React.useState<SortingState>([])
  const [sortingStudents, setSortingStudents] = React.useState<SortingState>([])
  const [sortingTeachers, setSortingTeachers] = React.useState<SortingState>([])
  const [sortingLevels, setSortingLevels] = React.useState<SortingState>([])
  const [sortingReports, setSortingReports] = React.useState<SortingState>([])

  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    username: "",
    phonenumber: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setFormData({ email: "", password: "", username: "", phonenumber: "" })
    setFormError(null)
  }

  const handleAddUser = async () => {
    if (!formData.email || !formData.password) {
      setFormError("Email and password are required")
      return
    }
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }
    if (!school?.tenant_id) {
      setFormError("School tenant ID not found")
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) throw new Error("Not authenticated")

      await createUserByAdmin(token, {
        email: formData.email,
        password: formData.password,
        username: formData.username || undefined,
        user_type: "SCHOOL_ADMIN",
        tenant_id: school.tenant_id,
      })

      toast.success("School Admin created successfully")
      handleCloseDialog()

      // Refresh users list
      const usersRes = await getUsers(token)
      const matched = (usersRes.data ?? []).filter(
        (u) => school?.tenant_id && u.tenant_id === school.tenant_id
      )
      setUsers(matched)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user"
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportToExcel = (data: any[], fileName: string, sheetName: string) => {
    if (!data || data.length === 0) {
      toast.error("No data available to export")
      return
    }
    try {
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      XLSX.writeFile(workbook, `${fileName}.xlsx`)
      toast.success(`${sheetName} exported successfully`)
    } catch (err) {
      toast.error("Failed to export to Excel")
      console.error(err)
    }
  }

  const openExportModal = (type: "students" | "teachers" | "users" | "branches" | "levels" | "reports") => {
    setExportType(type)
    if (type === "students") {
      setAvailableColumns([
        { id: "studentcode", label: "Student Code", checked: true },
        { id: "enname", label: "English Name", checked: true },
        { id: "khname", label: "Khmer Name", checked: true },
        { id: "zhname", label: "Chinese Name", checked: true },
        { id: "gender", label: "Gender", checked: true },
        { id: "date_of_birth", label: "Date of Birth", checked: true },
        { id: "place_of_birth", label: "Place of Birth", checked: true },
        { id: "current_address", label: "Current Address", checked: true },
        { id: "nationality", label: "Nationality", checked: true },
        { id: "branch", label: "Branch", checked: true },
        { id: "level", label: "Level", checked: true },
        { id: "father_name", label: "Father Name", checked: true },
        { id: "father_phone", label: "Father Phone", checked: true },
        { id: "mother_name", label: "Mother Name", checked: true },
        { id: "mother_phone", label: "Mother Phone", checked: true },
        { id: "status", label: "Status", checked: true },
      ])
    } else if (type === "teachers") {
      setAvailableColumns([
        { id: "teachercode", label: "Teacher Code", checked: true },
        { id: "enname", label: "English Name", checked: true },
        { id: "khname", label: "Khmer Name", checked: true },
        { id: "zhname", label: "Chinese Name", checked: true },
        { id: "gender", label: "Gender", checked: true },
        { id: "date_of_birth", label: "Date of Birth", checked: true },
        { id: "place_of_birth", label: "Place of Birth", checked: true },
        { id: "current_address", label: "Current Address", checked: true },
        { id: "nationality", label: "Nationality", checked: true },
        { id: "branch", label: "Branch", checked: true },
        { id: "father_name", label: "Father Name", checked: true },
        { id: "father_phone", label: "Father Phone", checked: true },
        { id: "mother_name", label: "Mother Name", checked: true },
        { id: "mother_phone", label: "Mother Phone", checked: true },
        { id: "status", label: "Status", checked: true },
      ])
    } else if (type === "users") {
      setAvailableColumns([
        { id: "username", label: "Name", checked: true },
        { id: "email", label: "Email", checked: true },
        { id: "phonenumber", label: "Phone", checked: true },
        { id: "role", label: "Role", checked: true },
        { id: "status", label: "Status", checked: true },
        { id: "tenant_id", label: "Tenant ID", checked: true },
        { id: "joined_date", label: "Joined Date", checked: true },
      ])
    } else if (type === "branches") {
      setAvailableColumns([
        { id: "khname", label: "Khmer Name", checked: true },
        { id: "enname", label: "English Name", checked: true },
        { id: "zhname", label: "Chinese Name", checked: true },
        { id: "code_prefix", label: "Code Prefix", checked: true },
        { id: "code_suffix", label: "Code Suffix", checked: true },
        { id: "code_digit", label: "Code Digit", checked: true },
        { id: "status", label: "Status", checked: true },
        { id: "phone", label: "Phone", checked: true },
        { id: "address", label: "Address", checked: true },
      ])
    } else if (type === "levels") {
      setAvailableColumns([
        { id: "name", label: "Level Name", checked: true },
        { id: "description", label: "Description", checked: true },
        { id: "display_order", label: "Order", checked: true },
        { id: "status", label: "Status", checked: true },
      ])
    } else if (type === "reports") {
      setAvailableColumns([
        { id: "title", label: "Report Title", checked: true },
        { id: "type", label: "Type", checked: true },
        { id: "branch", label: "Branch", checked: true },
        { id: "teacher", label: "Teacher", checked: true },
        { id: "student", label: "Student", checked: true },
        { id: "score", label: "Score", checked: true },
        { id: "date", label: "Date", checked: true },
        { id: "status", label: "Status", checked: true },
        { id: "description", label: "Description", checked: true },
        { id: "notes", label: "Notes", checked: true },
      ])
    }
  }

  const toggleColumn = (id: string) => {
    setAvailableColumns(prev =>
      prev.map(col => (col.id === id ? { ...col, checked: !col.checked } : col))
    )
  }

  const handleSelectAllToggle = () => {
    const allChecked = availableColumns.every(col => col.checked)
    setAvailableColumns(prev => prev.map(col => ({ ...col, checked: !allChecked })))
  }

  const handleExecuteExport = () => {
    const checkedIds = availableColumns.filter(c => c.checked).map(c => c.id)
    if (checkedIds.length === 0) {
      toast.error("Please select at least one column to export")
      return
    }

    if (exportType === "students") {
      const clean = students.map((s, i) => {
        const pob = [s.pob_village, s.pob_commune, s.pob_district, s.pob_province].filter(Boolean).join(", ")
        const cur = [s.cur_village, s.cur_commune, s.cur_district, s.cur_province].filter(Boolean).join(", ")
        
        const row: Record<string, any> = { "#": i + 1 }
        
        if (checkedIds.includes("studentcode")) row["Student Code"] = s.studentcode || "—"
        if (checkedIds.includes("enname")) row["English Name"] = s.enname || "—"
        if (checkedIds.includes("khname")) row["Khmer Name"] = s.khname || "—"
        if (checkedIds.includes("zhname")) row["Chinese Name"] = s.zhname || "—"
        if (checkedIds.includes("gender")) row["Gender"] = s.gender || "—"
        if (checkedIds.includes("date_of_birth")) row["Date of Birth"] = s.date_of_birth || "—"
        if (checkedIds.includes("place_of_birth")) row["Place of Birth"] = pob || "—"
        if (checkedIds.includes("current_address")) row["Current Address"] = cur || "—"
        if (checkedIds.includes("nationality")) row["Nationality"] = s.nationality === 'Local' ? 'Cambodian' : (s.nationality || "—")
        if (checkedIds.includes("branch")) row["Branch"] = branchMap[s.branch_id ?? ""] || s.branch_id || "—"
        if (checkedIds.includes("level")) row["Level"] = s.level_id || "—"
        if (checkedIds.includes("father_name")) row["Father Name"] = s.father_name || "—"
        if (checkedIds.includes("father_phone")) row["Father Phone"] = s.father_phone || "—"
        if (checkedIds.includes("mother_name")) row["Mother Name"] = s.mother_name || "—"
        if (checkedIds.includes("mother_phone")) row["Mother Phone"] = s.mother_phone || "—"
        if (checkedIds.includes("status")) row["Status"] = s.status || "INACTIVE"
        
        return row
      })
      handleExportToExcel(clean, `${school?.enname || 'School'}_Students`, "Students")
    } else if (exportType === "teachers") {
      const clean = teachers.map((t, i) => {
        const pob = [t.pob_village, t.pob_commune, t.pob_district, t.pob_province].filter(Boolean).join(", ")
        const cur = [t.cur_village, t.cur_commune, t.cur_district, t.cur_province].filter(Boolean).join(", ")
        
        const row: Record<string, any> = { "#": i + 1 }
        
        if (checkedIds.includes("teachercode")) row["Teacher Code"] = t.teachercode || "—"
        if (checkedIds.includes("enname")) row["English Name"] = t.enname || "—"
        if (checkedIds.includes("khname")) row["Khmer Name"] = t.khname || "—"
        if (checkedIds.includes("zhname")) row["Chinese Name"] = t.zhname || "—"
        if (checkedIds.includes("gender")) row["Gender"] = t.gender || "—"
        if (checkedIds.includes("date_of_birth")) row["Date of Birth"] = t.date_of_birth || "—"
        if (checkedIds.includes("place_of_birth")) row["Place of Birth"] = pob || "—"
        if (checkedIds.includes("current_address")) row["Current Address"] = cur || "—"
        if (checkedIds.includes("nationality")) row["Nationality"] = t.nationality === 'Local' ? 'Cambodian' : (t.nationality || "—")
        if (checkedIds.includes("branch")) row["Branch"] = branchMap[t.branch_id ?? ""] || t.branch_id || "—"
        if (checkedIds.includes("father_name")) row["Father Name"] = t.father_name || "—"
        if (checkedIds.includes("father_phone")) row["Father Phone"] = t.father_phone || "—"
        if (checkedIds.includes("mother_name")) row["Mother Name"] = t.mother_name || "—"
        if (checkedIds.includes("mother_phone")) row["Mother Phone"] = t.mother_phone || "—"
        if (checkedIds.includes("status")) row["Status"] = t.is_active ? "Active" : "Inactive"
        
        return row
      })
      handleExportToExcel(clean, `${school?.enname || 'School'}_Teachers`, "Teachers")
    } else if (exportType === "users") {
      const clean = users.map((u, i) => {
        const row: Record<string, any> = { "#": i + 1 }
        if (checkedIds.includes("username")) row["Name"] = u.username || "—"
        if (checkedIds.includes("email")) row["Email"] = u.email
        if (checkedIds.includes("phonenumber")) row["Phone"] = u.phonenumber || "—"
        if (checkedIds.includes("role")) row["Role"] = u.user_type === "SUPER_ADMIN" ? "Super Admin" : "School Admin"
        if (checkedIds.includes("status")) row["Status"] = u.status
        if (checkedIds.includes("tenant_id")) row["Tenant ID"] = u.tenant_id || "—"
        if (checkedIds.includes("joined_date")) row["Joined Date"] = u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"
        return row
      })
      handleExportToExcel(clean, `${school?.enname || 'School'}_Users`, "Users")
    } else if (exportType === "branches") {
      const clean = branches.map((b, i) => {
        const row: Record<string, any> = { "#": i + 1 }
        if (checkedIds.includes("khname")) row["Khmer Name"] = b.khname || "—"
        if (checkedIds.includes("enname")) row["English Name"] = b.enname || "—"
        if (checkedIds.includes("zhname")) row["Chinese Name"] = b.zhname || "—"
        if (checkedIds.includes("code_prefix")) row["Code Prefix"] = b.student_code_prefix || "—"
        if (checkedIds.includes("code_suffix")) row["Code Suffix"] = b.student_code_suffix || "—"
        if (checkedIds.includes("code_digit")) row["Code Digit"] = b.student_code_digit ?? "—"
        if (checkedIds.includes("status")) row["Status"] = b.status || "inactive"
        if (checkedIds.includes("phone")) row["Phone"] = b.phone || "—"
        if (checkedIds.includes("address")) row["Address"] = b.address || "—"
        return row
      })
      handleExportToExcel(clean, `${school?.enname || 'School'}_Branches`, "Branches")
    } else if (exportType === "levels") {
      const clean = levels.map((l, i) => {
        const row: Record<string, any> = { "#": i + 1 }
        if (checkedIds.includes("name")) row["Level Name"] = l.name || "—"
        if (checkedIds.includes("description")) row["Description"] = l.description || "—"
        if (checkedIds.includes("display_order")) row["Order"] = l.display_order ?? "—"
        if (checkedIds.includes("status")) row["Status"] = l.status || "inactive"
        return row
      })
      handleExportToExcel(clean, `${school?.enname || 'School'}_Levels`, "Levels")
    } else if (exportType === "reports") {
      const clean = reports.map((r, i) => {
        const row: Record<string, any> = { "#": i + 1 }
        if (checkedIds.includes("title")) row["Report Title"] = r.title || "—"
        if (checkedIds.includes("type")) row["Type"] = r.type || "—"
        if (checkedIds.includes("branch")) row["Branch"] = branchMap[r.branch_id ?? ""] || r.branch_id || "—"
        if (checkedIds.includes("teacher")) row["Teacher"] = teacherMap[r.teacher_id ?? ""] || r.teacher_id || "—"
        if (checkedIds.includes("student")) row["Student"] = studentMap[r.student_id ?? ""] || r.student_id || "—"
        if (checkedIds.includes("score")) row["Score"] = r.score ?? "—"
        if (checkedIds.includes("date")) row["Date"] = r.date ? new Date(r.date).toLocaleDateString() : "—"
        if (checkedIds.includes("status")) row["Status"] = r.status || "draft"
        if (checkedIds.includes("description")) row["Description"] = r.description || "—"
        if (checkedIds.includes("notes")) row["Notes"] = r.notes || "—"
        return row
      })
      handleExportToExcel(clean, `${school?.enname || 'School'}_Reports`, "Reports")
    }
    setExportType(null)
  }

  React.useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = localStorage.getItem(AUTH_TOKEN_KEY)
        if (!token) throw new Error("Not authenticated")

        const [schoolRes, usersRes, branchesRes, studentsRes, employeesRes, levelsRes, reportsRes] = await Promise.all([
          getSchool(token, schoolId),
          getUsers(token),
          getBranches(token),
          getStudents(token),
          getEmployees(token),
          getLevels(token, schoolId),
          getReports(token),
        ])

        const found = schoolRes.data ?? null
        setSchool(found)

        // Match users: same user_id OR same tenant_id as this school
        const matchedUsers = (usersRes.data ?? []).filter(
          (u) =>
            (found?.user_id && u.id === found.user_id) ||
            (found?.tenant_id && u.tenant_id === found.tenant_id)
        )
        setUsers(matchedUsers)

        // Match branches: school_id OR tenant_id
        const matchedBranches = (branchesRes.data ?? []).filter(
          (b) => b.school_id === schoolId || (found?.tenant_id && b.tenant_id === found.tenant_id)
        )
        setBranches(matchedBranches)

        // Match students: school_id OR tenant_id
        const matchedStudents = (studentsRes.data ?? []).filter(
          (s) => s.school_id === schoolId || (found?.tenant_id && s.tenant_id === found.tenant_id)
        )
        setStudents(matchedStudents)

        // Match teachers: school_id OR tenant_id
        const matchedTeachers = (employeesRes.data ?? []).filter(
          (e) => e.school_id === schoolId || (found?.tenant_id && e.tenant_id === found.tenant_id)
        )
        setTeachers(matchedTeachers)

        // Levels: getLevels(token, schoolId) is already filtered by backend
        setLevels(levelsRes.data ?? [])

        // Match reports: school_id OR tenant_id
        const matchedReports = (reportsRes.data ?? []).filter(
          (r) => r.school_id === schoolId || (found?.tenant_id && r.tenant_id === found.tenant_id)
        )
        setReports(matchedReports)

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load school")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [schoolId])

  // ── 1. Users Columns ──────────────────────────────────────
  const userColumns: ColumnDef<ApiUser>[] = React.useMemo(() => [
    {
      id: "index",
      header: "No",
      cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "username",
      header: "Name",
      cell: ({ row }) => {
        const u = row.original
        const displayName = u.username || u.email || "Unknown"
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{displayName}</span>
            {u.user_type === "SCHOOL_ADMIN" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                School Admin
              </span>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email") || "—"
    },
    {
      accessorKey: "phonenumber",
      header: "Phone",
      cell: ({ row }) => row.getValue("phonenumber") || <span className="text-muted-foreground italic">—</span>
    },
    {
      accessorKey: "user_type",
      header: "Role",
      cell: ({ row }) => {
        const type = row.getValue("user_type") as string
        return (
          <Badge variant={type === "SUPER_ADMIN" ? "default" : "secondary"} className="text-xs">
            {type === "SUPER_ADMIN" ? "Super Admin" : "School Admin"}
          </Badge>
        )
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status") as string} />
    },
    {
      accessorKey: "tenant_id",
      header: "Tenant ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("tenant_id") || "—"}</span>
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => {
        const val = row.getValue("created_at") as string
        return <span className="text-sm text-muted-foreground">{val ? new Date(val).toLocaleDateString() : "—"}</span>
      }
    }
  ], [])

  // ── 2. Branches Columns ───────────────────────────────────
  const branchColumns: ColumnDef<ApiBranch>[] = React.useMemo(() => [
    {
      id: "index",
      header: "No",
      cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "khname",
      header: "Khmer Name",
      cell: ({ row }) => row.getValue("khname") || "—"
    },
    {
      accessorKey: "enname",
      header: "English Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("enname") || "—"}</span>
    },
    {
      accessorKey: "zhname",
      header: "Chinese Name",
      cell: ({ row }) => row.getValue("zhname") || "—"
    },
    {
      accessorKey: "student_code_prefix",
      header: "Code Prefix",
      cell: ({ row }) => row.getValue("student_code_prefix") || "—"
    },
    {
      accessorKey: "student_code_suffix",
      header: "Code Suffix",
      cell: ({ row }) => row.getValue("student_code_suffix") || "—"
    },
    {
      accessorKey: "student_code_digit",
      header: "Code Digit",
      cell: ({ row }) => row.getValue("student_code_digit") ?? "—"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {status || "inactive"}
          </span>
        )
      }
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.getValue("phone") || "—"
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => row.getValue("address") || "—"
    }
  ], [])

  // ── 3. Students Columns ───────────────────────────────────
  const studentColumns: ColumnDef<ApiStudent>[] = React.useMemo(() => [
    {
      id: "index",
      header: "No",
      cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const photo = row.getValue("photo") as string
        return (
          <div className="w-10 h-10 rounded-full overflow-hidden border">
            <img src={getImageUrl(photo) || "/resources/avatar/non_pic.jpg"} alt="" className="w-full h-full object-cover" />
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "studentcode",
      header: "Student Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("studentcode") || "—"}</span>
    },
    {
      accessorKey: "enname",
      header: "English Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("enname") || "—"}</span>
    },
    {
      accessorKey: "khname",
      header: "Khmer Name",
      cell: ({ row }) => row.getValue("khname") || "—"
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => row.getValue("gender") || "—"
    },
    {
      accessorKey: "date_of_birth",
      header: "Date of Birth",
      cell: ({ row }) => row.getValue("date_of_birth") || "—"
    },
    {
      id: "place_of_birth",
      header: "Place of Birth",
      accessorFn: (row) => [row.pob_village, row.pob_commune, row.pob_district, row.pob_province].filter(Boolean).join(", "),
      cell: ({ row }) => {
        const { pob_province, pob_district, pob_commune, pob_village } = row.original
        const full = [pob_village, pob_commune, pob_district, pob_province].filter(Boolean).join(", ")
        return <span title={full}>{full || "—"}</span>
      }
    },
    {
      id: "current_address",
      header: "Current Address",
      accessorFn: (row) => [row.cur_village, row.cur_commune, row.cur_district, row.cur_province].filter(Boolean).join(", "),
      cell: ({ row }) => {
        const { cur_province, cur_district, cur_commune, cur_village } = row.original
        const full = [cur_village, cur_commune, cur_district, cur_province].filter(Boolean).join(", ")
        return <span title={full}>{full || "—"}</span>
      }
    },
    {
      accessorKey: "father_name",
      header: "Father Name",
      cell: ({ row }) => row.getValue("father_name") || "—"
    },
    {
      accessorKey: "father_phone",
      header: "Father Phone",
      cell: ({ row }) => row.getValue("father_phone") || "—"
    },
    {
      accessorKey: "mother_name",
      header: "Mother Name",
      cell: ({ row }) => row.getValue("mother_name") || "—"
    },
    {
      accessorKey: "mother_phone",
      header: "Mother Phone",
      cell: ({ row }) => row.getValue("mother_phone") || "—"
    },
    {
      accessorKey: "joinschool",
      header: "Join School",
      cell: ({ row }) => row.getValue("joinschool") || "—"
    },
    {
      accessorKey: "leftschool",
      header: "Left School",
      cell: ({ row }) => row.getValue("leftschool") || "—"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {status || "INACTIVE"}
          </span>
        )
      }
    }
  ], [])

  // ── 4. Teachers Columns ───────────────────────────────────
  const teacherColumns: ColumnDef<ApiEmployee>[] = React.useMemo(() => [
    {
      id: "index",
      header: "No",
      cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const photo = row.getValue("photo") as string
        return (
          <div className="w-10 h-10 rounded-full overflow-hidden border">
            <img src={getImageUrl(photo) || "/resources/avatar/non-pic1.png"} alt="" className="w-full h-full object-cover" />
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "teachercode",
      header: "Teacher Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("teachercode") || "—"}</span>
    },
    {
      accessorKey: "enname",
      header: "English Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("enname") || "—"}</span>
    },
    {
      accessorKey: "khname",
      header: "Khmer Name",
      cell: ({ row }) => row.getValue("khname") || "—"
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => row.getValue("gender") || "—"
    },
    {
      accessorKey: "date_of_birth",
      header: "Date of Birth",
      cell: ({ row }) => row.getValue("date_of_birth") || "—"
    },
    {
      id: "place_of_birth",
      header: "Place of Birth",
      accessorFn: (row) => [row.pob_village, row.pob_commune, row.pob_district, row.pob_province].filter(Boolean).join(", "),
      cell: ({ row }) => {
        const { pob_province, pob_district, pob_commune, pob_village } = row.original
        const full = [pob_village, pob_commune, pob_district, pob_province].filter(Boolean).join(", ")
        return <span title={full}>{full || "—"}</span>
      }
    },
    {
      id: "current_address",
      header: "Current Address",
      accessorFn: (row) => [row.cur_village, row.cur_commune, row.cur_district, row.cur_province].filter(Boolean).join(", "),
      cell: ({ row }) => {
        const { cur_province, cur_district, cur_commune, cur_village } = row.original
        const full = [cur_village, cur_commune, cur_district, cur_province].filter(Boolean).join(", ")
        return <span title={full}>{full || "—"}</span>
      }
    },
    {
      accessorKey: "father_name",
      header: "Father Name",
      cell: ({ row }) => row.getValue("father_name") || "—"
    },
    {
      accessorKey: "father_phone",
      header: "Father Phone",
      cell: ({ row }) => row.getValue("father_phone") || "—"
    },
    {
      accessorKey: "mother_name",
      header: "Mother Name",
      cell: ({ row }) => row.getValue("mother_name") || "—"
    },
    {
      accessorKey: "mother_phone",
      header: "Mother Phone",
      cell: ({ row }) => row.getValue("mother_phone") || "—"
    },
    {
      accessorKey: "joinwork",
      header: "Join Work",
      cell: ({ row }) => row.getValue("joinwork") || "—"
    },
    {
      accessorKey: "leftwork",
      header: "Left Work",
      cell: ({ row }) => row.getValue("leftwork") || "—"
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const is_active = row.getValue("is_active") as boolean
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {is_active ? "Active" : "Inactive"}
          </span>
        )
      }
    }
  ], [])

  // ── 5. Levels Columns ─────────────────────────────────────
  const levelColumns: ColumnDef<ApiLevel>[] = React.useMemo(() => [
    {
      id: "index",
      header: "No",
      cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Level Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("name") || "—"}</span>
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.getValue("description") || "—"
    },
    {
      accessorKey: "display_order",
      header: "Order",
      cell: ({ row }) => row.getValue("display_order") ?? "—"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {status || "inactive"}
          </span>
        )
      }
    }
  ], [])

  // Maps for Report associations
  const branchMap = React.useMemo(() => {
    const map: Record<string | number, string> = {}
    branches.forEach((b) => {
      map[b.id] = b.enname || b.khname || `Branch #${b.id}`
    })
    return map
  }, [branches])

  const teacherMap = React.useMemo(() => {
    const map: Record<string | number, string> = {}
    teachers.forEach((t) => {
      map[t.id] = t.enname || t.khname || `Teacher #${t.id}`
    })
    return map
  }, [teachers])

  const studentMap = React.useMemo(() => {
    const map: Record<string | number, string> = {}
    students.forEach((s) => {
      map[s.id] = s.enname || s.khname || `Student #${s.id}`
    })
    return map
  }, [students])

  // ── 6. Reports Columns ────────────────────────────────────
  const reportColumns: ColumnDef<ApiReport>[] = React.useMemo(() => [
    {
      id: "index",
      header: "No",
      cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: "Report Title",
      cell: ({ row }) => <span className="font-medium">{row.getValue("title") || "—"}</span>
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <span className="capitalize">{row.getValue("type") || "—"}</span>
    },
    {
      accessorKey: "branch_id",
      header: "Branch",
      cell: ({ row }) => {
        const val = row.getValue("branch_id") as string | number
        return <span>{branchMap[val] || val || "—"}</span>
      }
    },
    {
      accessorKey: "teacher_id",
      header: "Teacher",
      cell: ({ row }) => {
        const val = row.getValue("teacher_id") as string | number
        return <span>{teacherMap[val] || val || "—"}</span>
      }
    },
    {
      accessorKey: "student_id",
      header: "Student",
      cell: ({ row }) => {
        const val = row.getValue("student_id") as string | number
        return <span>{studentMap[val] || val || "—"}</span>
      }
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => row.getValue("score") ?? "—"
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const val = row.getValue("date") as string
        return <span>{val ? new Date(val).toLocaleDateString() : "—"}</span>
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variantMap: Record<string, string> = {
          published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
          draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          archived: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            variantMap[status] ?? "bg-muted text-muted-foreground"
          }`}>
            {status || "draft"}
          </span>
        )
      }
    }
  ], [branchMap, teacherMap, studentMap])

  // ── Hook instantiations ───────────────────────────────────
  const tableUsers = useReactTable({
    data: users,
    columns: userColumns,
    onSortingChange: setSortingUsers,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: { sorting: sortingUsers },
  })

  const tableBranches = useReactTable({
    data: branches,
    columns: branchColumns,
    onSortingChange: setSortingBranches,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: { sorting: sortingBranches },
  })

  const tableStudents = useReactTable({
    data: students,
    columns: studentColumns,
    onSortingChange: setSortingStudents,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: { sorting: sortingStudents },
  })

  const tableTeachers = useReactTable({
    data: teachers,
    columns: teacherColumns,
    onSortingChange: setSortingTeachers,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: { sorting: sortingTeachers },
  })

  const tableLevels = useReactTable({
    data: levels,
    columns: levelColumns,
    onSortingChange: setSortingLevels,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: { sorting: sortingLevels },
  })

  const tableReports = useReactTable({
    data: reports,
    columns: reportColumns,
    onSortingChange: setSortingReports,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: { sorting: sortingReports },
  })

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-3 lg:px-4 space-y-6">

            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 -ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => router.push(isSchoolAdmin ? "/dashboard/school-admin" : "/dashboard/school/view")}
            >
              <IconArrowLeft className="h-4 w-4" />
              {isSchoolAdmin ? "Back to Dashboard" : "Back to Schools"}
            </Button>

            {/* Error */}
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* School info strip */}
            <div className="rounded-xl border bg-card/45 backdrop-blur-sm px-4 py-2.5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* School Name & Tenant ID */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconSchool className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold leading-tight">
                      {isLoading ? (
                        <Skeleton className="h-4 w-32" />
                      ) : (
                        school?.enname || school?.khname || "Unnamed School"
                      )}
                    </h2>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Tenant ID: {school?.tenant_id || "—"}
                    </span>
                  </div>
                </div>

                {/* Metadata Details in a Single Row */}
                {isLoading ? (
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ) : school ? (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    {school.khname && (
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-muted-foreground">Khmer Name</div>
                        <div className="font-semibold">{school.khname}</div>
                      </div>
                    )}
                    {school.zhname && (
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-muted-foreground">Chinese Name</div>
                        <div className="font-semibold">{school.zhname}</div>
                      </div>
                    )}
                    {school.short_school && (
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-muted-foreground">Short Name</div>
                        <div className="font-semibold">{school.short_school}</div>
                      </div>
                    )}
                    {(school.student_code_prefix || school.student_code_suffix) && (
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-muted-foreground">Code Prefix / Suffix</div>
                        <div className="font-semibold">
                          {school.student_code_prefix || "—"} / {school.student_code_suffix || "—"}
                        </div>
                      </div>
                    )}
                    {school.student_code_digit != null && (
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-muted-foreground">Digit Length</div>
                        <div className="font-semibold">{school.student_code_digit}</div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Tabbed School Data */}
            <Tabs defaultValue="users" className="w-full space-y-4">
              <TabsList className="flex flex-wrap w-full md:w-auto h-auto bg-muted/60 p-1.5 rounded-xl gap-1 justify-start">
                <TabsTrigger value="users" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <IconUser className="h-4 w-4" />
                  <span>Users ({isLoading ? "..." : users.length})</span>
                </TabsTrigger>
                <TabsTrigger value="branches" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <IconBuilding className="h-4 w-4" />
                  <span>Branches ({isLoading ? "..." : branches.length})</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <IconCertificate2 className="h-4 w-4" />
                  <span>Students ({isLoading ? "..." : students.length})</span>
                </TabsTrigger>
                <TabsTrigger value="teachers" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <IconUsers className="h-4 w-4" />
                  <span>Teachers ({isLoading ? "..." : teachers.length})</span>
                </TabsTrigger>
                <TabsTrigger value="levels" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <IconBook className="h-4 w-4" />
                  <span>Levels ({isLoading ? "..." : levels.length})</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <IconReport className="h-4 w-4" />
                  <span>Reports ({isLoading ? "..." : reports.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4 outline-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IconUser className="h-5 w-5 text-primary" />
                    School Users
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors"
                      onClick={() => openExportModal("users")}
                      disabled={users.length === 0}
                    >
                      <IconFileSpreadsheet className="h-4 w-4" />
                      <span>Export to Excel</span>
                    </Button>
                    {!isLoading && (
                      <Badge variant="secondary">
                        {users.length} user{users.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                <ResizableTable
                  table={tableUsers}
                  columnsCount={userColumns.length}
                  isLoading={isLoading}
                  emptyMessage="No users linked to this school."
                />
              </TabsContent>

              <TabsContent value="branches" className="space-y-4 outline-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IconBuilding className="h-5 w-5 text-primary" />
                    School Branches
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors"
                      onClick={() => openExportModal("branches")}
                      disabled={branches.length === 0}
                    >
                      <IconFileSpreadsheet className="h-4 w-4" />
                      <span>Export to Excel</span>
                    </Button>
                    {!isLoading && (
                      <Badge variant="secondary">
                        {branches.length} branch{branches.length !== 1 ? "es" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                <ResizableTable
                  table={tableBranches}
                  columnsCount={branchColumns.length}
                  isLoading={isLoading}
                  emptyMessage="No branches linked to this school."
                />
              </TabsContent>

              <TabsContent value="students" className="space-y-4 outline-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IconUsers className="h-5 w-5 text-primary" />
                    School Students
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors"
                      onClick={() => openExportModal("students")}
                      disabled={students.length === 0}
                    >
                      <IconFileSpreadsheet className="h-4 w-4" />
                      <span>Export to Excel</span>
                    </Button>
                    {!isLoading && (
                      <Badge variant="secondary">
                        {students.length} student{students.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                <ResizableTable
                  table={tableStudents}
                  columnsCount={studentColumns.length}
                  isLoading={isLoading}
                  emptyMessage="No students linked to this school."
                  onRowClick={(row) => setSelectedStudent(row)}
                />
              </TabsContent>

              <TabsContent value="teachers" className="space-y-4 outline-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IconUsers className="h-5 w-5 text-primary" />
                    School Teachers
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors"
                      onClick={() => openExportModal("teachers")}
                      disabled={teachers.length === 0}
                    >
                      <IconFileSpreadsheet className="h-4 w-4" />
                      <span>Export to Excel</span>
                    </Button>
                    {!isLoading && (
                      <Badge variant="secondary">
                        {teachers.length} teacher{teachers.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                <ResizableTable
                  table={tableTeachers}
                  columnsCount={teacherColumns.length}
                  isLoading={isLoading}
                  emptyMessage="No teachers linked to this school."
                  onRowClick={(row) => setSelectedTeacher(row)}
                />
              </TabsContent>

              <TabsContent value="levels" className="space-y-4 outline-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IconBook className="h-5 w-5 text-primary" />
                    School Levels
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors"
                      onClick={() => openExportModal("levels")}
                      disabled={levels.length === 0}
                    >
                      <IconFileSpreadsheet className="h-4 w-4" />
                      <span>Export to Excel</span>
                    </Button>
                    {!isLoading && (
                      <Badge variant="secondary">
                        {levels.length} level{levels.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                <ResizableTable
                  table={tableLevels}
                  columnsCount={levelColumns.length}
                  isLoading={isLoading}
                  emptyMessage="No levels configured for this school."
                />
              </TabsContent>

              <TabsContent value="reports" className="space-y-4 outline-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IconReport className="h-5 w-5 text-primary" />
                    School Reports
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors"
                      onClick={() => openExportModal("reports")}
                      disabled={reports.length === 0}
                    >
                      <IconFileSpreadsheet className="h-4 w-4" />
                      <span>Export to Excel</span>
                    </Button>
                    {!isLoading && (
                      <Badge variant="secondary">
                        {reports.length} report{reports.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                <ResizableTable
                  table={tableReports}
                  columnsCount={reportColumns.length}
                  isLoading={isLoading}
                  emptyMessage="No reports filed for this school."
                />
              </TabsContent>
            </Tabs>

            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
              <DialogContent className="max-w-[1000px] sm:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background/95 backdrop-blur z-50">
                  <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <IconUser className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <span>Student Details - {selectedStudent?.enname || selectedStudent?.khname}</span>
                  </DialogTitle>
                </DialogHeader>

                {selectedStudent && (
                  <div className="px-6 py-5 space-y-6">
                    {/* Profile Header Block */}
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 rounded-2xl border shadow-sm relative overflow-hidden">
                      <div className="w-24 h-24 rounded-2xl border-2 border-background shadow-md overflow-hidden shrink-0 bg-muted flex items-center justify-center relative z-10">
                        <img
                          src={getImageUrl(selectedStudent.photo) || "/resources/avatar/non_pic.jpg"}
                          alt={selectedStudent.enname}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-2 relative z-10">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                          <h4 className="text-xl font-bold tracking-tight">{selectedStudent.enname} {selectedStudent.khname ? <span className="text-muted-foreground font-medium text-lg">({selectedStudent.khname})</span> : ''}</h4>
                          <Badge variant={selectedStudent.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px] px-2 py-0.5 shadow-sm">
                            {selectedStudent.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground/80 font-medium bg-muted/50 inline-block px-2 py-0.5 rounded-md">Code: {selectedStudent.studentcode || "—"}</p>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start pt-2">
                          <span className="flex items-center gap-1.5"><IconUser className="w-4 h-4 opacity-70"/> {selectedStudent.gender || "—"}</span>
                          <span className="flex items-center gap-1.5"><IconStack className="w-4 h-4 opacity-70"/> {selectedStudent.nationality === 'Local' ? 'Cambodian' : (selectedStudent.nationality || "—")}</span>
                          <span className="flex items-center gap-1.5"><IconStack className="w-4 h-4 opacity-70"/> {selectedStudent.religion || "—"}</span>
                          <span className="flex items-center gap-1.5"><IconCalendar className="w-4 h-4 opacity-70"/> {selectedStudent.date_of_birth || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Timeline & Associations */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                            <IconCalendar className="h-4 w-4" />
                          </div>
                          School Timeline
                        </h5>
                        <div className="text-sm bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <InfoRow label="Join School" value={selectedStudent.joinschool} />
                          <InfoRow label="Left School" value={selectedStudent.leftschool} />
                          <InfoRow label="Level ID" value={selectedStudent.level_id ? String(selectedStudent.level_id) : undefined} />
                          <InfoRow label="Branch ID" value={selectedStudent.branch_id ? String(selectedStudent.branch_id) : undefined} />
                        </div>
                      </div>

                      {/* Parents Info */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                            <IconUsers className="h-4 w-4" />
                          </div>
                          Family / Parents
                        </h5>
                        <div className="text-sm bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <InfoRow label="Father Name" value={selectedStudent.father_name} />
                          <InfoRow label="Father Phone" value={selectedStudent.father_phone} />
                          <InfoRow label="Mother Name" value={selectedStudent.mother_name} />
                          <InfoRow label="Mother Phone" value={selectedStudent.mother_phone} />
                        </div>
                      </div>

                      {/* Place of Birth */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                            <IconBuildingSkyscraper className="h-4 w-4" />
                          </div>
                          Place of Birth
                        </h5>
                        <div className="text-sm bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <InfoRow label="Province" value={selectedStudent.pob_province} />
                          <InfoRow label="District" value={selectedStudent.pob_district} />
                          <InfoRow label="Commune" value={selectedStudent.pob_commune} />
                          <InfoRow label="Village" value={selectedStudent.pob_village} />
                        </div>
                      </div>

                      {/* Current Address */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                            <IconBuildingSkyscraper className="h-4 w-4" />
                          </div>
                          Current Address
                        </h5>
                        <div className="text-sm bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <InfoRow label="Province" value={selectedStudent.cur_province} />
                          <InfoRow label="District" value={selectedStudent.cur_district} />
                          <InfoRow label="Commune" value={selectedStudent.cur_commune} />
                          <InfoRow label="Village" value={selectedStudent.cur_village} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                  <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Teacher Details Dialog */}
            <Dialog open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
              <DialogContent className="max-w-[1000px] sm:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background/95 backdrop-blur z-50">
                  <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <IconUsers className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <span>Teacher Details - {selectedTeacher?.enname || selectedTeacher?.khname}</span>
                  </DialogTitle>
                </DialogHeader>

                {selectedTeacher && (
                  <div className="px-6 py-5 space-y-6">
                    {/* Profile Header Block */}
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 rounded-2xl border shadow-sm relative overflow-hidden">
                      <div className="w-24 h-24 rounded-2xl border-2 border-background shadow-md overflow-hidden shrink-0 bg-muted flex items-center justify-center relative z-10">
                        <img
                          src={getImageUrl(selectedTeacher.photo) || "/resources/avatar/non-pic1.png"}
                          alt={selectedTeacher.enname}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-2 relative z-10">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                          <h4 className="text-xl font-bold tracking-tight">{selectedTeacher.enname} {selectedTeacher.khname ? <span className="text-muted-foreground font-medium text-lg">({selectedTeacher.khname})</span> : ''}</h4>
                          <Badge variant={selectedTeacher.is_active ? "default" : "secondary"} className="text-[10px] px-2 py-0.5 shadow-sm">
                            {selectedTeacher.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground/80 font-medium bg-muted/50 inline-block px-2 py-0.5 rounded-md">Code: {selectedTeacher.teachercode || "—"}</p>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start pt-2">
                          <span className="flex items-center gap-1.5"><IconUser className="w-4 h-4 opacity-70"/> {selectedTeacher.gender || "—"}</span>
                          <span className="flex items-center gap-1.5"><IconStack className="w-4 h-4 opacity-70"/> {selectedTeacher.nationality === 'Local' ? 'Cambodian' : (selectedTeacher.nationality || "—")}</span>
                          <span className="flex items-center gap-1.5"><IconStack className="w-4 h-4 opacity-70"/> {selectedTeacher.religion || "—"}</span>
                          <span className="flex items-center gap-1.5"><IconCalendar className="w-4 h-4 opacity-70"/> {selectedTeacher.date_of_birth || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Timeline & Associations */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                            <IconCalendar className="h-4 w-4" />
                          </div>
                          Work Timeline
                        </h5>
                        <div className="text-sm bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <InfoRow label="Join Work" value={selectedTeacher.joinwork} />
                          <InfoRow label="Left Work" value={selectedTeacher.leftwork} />
                          <InfoRow label="Branch ID" value={selectedTeacher.branch_id ? String(selectedTeacher.branch_id) : undefined} />
                        </div>
                      </div>

                      {/* Parents Info */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                            <IconUsers className="h-4 w-4" />
                          </div>
                          Family / Parents
                        </h5>
                        <div className="text-sm bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <InfoRow label="Father Name" value={selectedTeacher.father_name} />
                          <InfoRow label="Father Phone" value={selectedTeacher.father_phone} />
                          <InfoRow label="Mother Name" value={selectedTeacher.mother_name} />
                          <InfoRow label="Mother Phone" value={selectedTeacher.mother_phone} />
                        </div>
                      </div>

                      {/* Place of Birth */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                            <IconBuildingSkyscraper className="h-4 w-4" />
                          </div>
                          Place of Birth
                        </h5>
                        <div className="text-sm bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <InfoRow label="Province" value={selectedTeacher.pob_province} />
                          <InfoRow label="District" value={selectedTeacher.pob_district} />
                          <InfoRow label="Commune" value={selectedTeacher.pob_commune} />
                          <InfoRow label="Village" value={selectedTeacher.pob_village} />
                        </div>
                      </div>

                      {/* Current Address */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                            <IconBuildingSkyscraper className="h-4 w-4" />
                          </div>
                          Current Address
                        </h5>
                        <div className="text-sm bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <InfoRow label="Province" value={selectedTeacher.cur_province} />
                          <InfoRow label="District" value={selectedTeacher.cur_district} />
                          <InfoRow label="Commune" value={selectedTeacher.cur_commune} />
                          <InfoRow label="Village" value={selectedTeacher.cur_village} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                  <Button size="sm" variant="outline" onClick={() => setSelectedTeacher(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Column Selection Export Modal */}
            <Dialog open={exportType !== null} onOpenChange={(open) => !open && setExportType(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <IconFileSpreadsheet className="h-5 w-5 text-emerald-500" />
                    <span>Export to Excel</span>
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select the columns you want to include in the export.
                  </p>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 max-h-[50vh] overflow-y-auto">
                  {availableColumns.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2.5 cursor-pointer text-sm font-medium hover:text-primary select-none p-2 rounded-lg transition-colors hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={col.checked}
                        onChange={() => toggleColumn(col.id)}
                        className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>

                <DialogFooter className="flex items-center justify-between border-t pt-4 w-full gap-2 sm:justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold px-2 hover:bg-muted"
                    onClick={handleSelectAllToggle}
                  >
                    {availableColumns.every(c => c.checked) ? "Deselect All" : "Select All"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setExportType(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                      onClick={handleExecuteExport}
                    >
                      <IconFileSpreadsheet className="h-4 w-4" />
                      <span>Export</span>
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
