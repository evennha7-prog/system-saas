"use client"

import * as React from "react"
import * as XLSX from "xlsx"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddressSelect } from "@/components/address-select"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconPencil, IconTrash, IconTable, IconAlertTriangle, IconArrowsSort, IconArrowUp, IconArrowDown, IconUser, IconStack, IconCalendar, IconUsers, IconBuildingSkyscraper } from "@tabler/icons-react"

import { Student, columns, StudentTableMeta } from "./columns"
import { translations, t } from "@/lib/translations"
import religionsData from "@/app/Religions/religions.json"
import nationalitiesData from "@/app/nationalities-Json/nationalities.json"
import { AUTH_TOKEN_KEY, ApiStudent, StudentPayload, createStudent, deleteStudent, getStudents, updateStudent, uploadPhoto, getImageUrl } from "@/lib/api"
import type { Branch } from "@/app/dashboard/Branch/columns"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

function useLanguage() {
  const [language, setLanguage] = React.useState("en")

  React.useEffect(() => {
    const saved = localStorage.getItem("language")
    if (saved && ["en", "km", "zh"].includes(saved)) {
      setLanguage(saved)
    }

    const handleChange = () => {
      const saved = localStorage.getItem("language")
      if (saved && ["en", "km", "zh"].includes(saved)) {
        setLanguage(saved)
      }
    }

    window.addEventListener("languagechange", handleChange)
    return () => window.removeEventListener("languagechange", handleChange)
  }, [])

  return language
}

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

interface StudentTableProps {
  data: Student[]
  branchOptions?: Branch[]
  levelOptions?: { id: string; name: string }[]
  searchQuery?: string
  isLoading?: boolean
  error?: string | null
  readOnly?: boolean
  hideAddButton?: boolean
  hideActions?: boolean
  hideDelete?: boolean
  onCreate?: (payload: StudentPayload) => Promise<void>
  onUpdate?: (id: number, payload: Partial<StudentPayload>) => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

interface StudentFormData {
  [key: string]: string
  tenant_id: string
  school_id: string
  photo: string
  studentcode: string
  enname: string
  khname: string
  zhname: string
  gender: string
  date_of_birth: string
  nationality: string
  religion: string
  pob_province: string
  pob_district: string
  pob_commune: string
  pob_village: string
  cur_province: string
  cur_district: string
  cur_commune: string
  cur_village: string
  joinschool: string
  leftschool: string
  branchId: string
  levelId: string
  status: string
  father_name: string
  father_phone: string
  mother_name: string
  mother_phone: string
}

const emptyFormData: StudentFormData = {
  tenant_id: "",
  school_id: "",
  photo: "",
  studentcode: "",
  enname: "",
  khname: "",
  zhname: "",
  gender: "",
  date_of_birth: "",
  nationality: "",
  religion: "",
  pob_province: "",
  pob_district: "",
  pob_commune: "",
  pob_village: "",
  cur_province: "",
  cur_district: "",
  cur_commune: "",
  cur_village: "",
  joinschool: "",
  leftschool: "",
  branchId: "",
  levelId: "",
  status: "active",
  father_name: "",
  father_phone: "",
  mother_name: "",
  mother_phone: "",
}

export function StudentTable({
  data: initialData,
  searchQuery = "",
  isLoading = false,
  error = null,
  branchOptions = [],
  levelOptions = [],
  readOnly = false,
  hideAddButton = false,
  hideActions = false,
  hideDelete = false,
  onCreate,
  onUpdate,
  onDelete,
}: StudentTableProps) {
  const language = useLanguage()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [tableData, setTableData] = React.useState<Student[]>(initialData)
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)
  const [selectedExportCols, setSelectedExportCols] = React.useState<Record<string, boolean>>({
    studentcode: true,
    enname: true,
    khname: true,
    zhname: true,
    gender: true,
    date_of_birth: true,
    place_of_birth: true,
    current_address: true,
    nationality: true,
    branch: true,
    level: true,
    father_name: true,
    father_phone: true,
    mother_name: true,
    mother_phone: true,
    status: true,
  })
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<StudentFormData>(emptyFormData)
  const [isUploading, setIsUploading] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [viewStudent, setViewStudent] = React.useState<Student | null>(null)
  const [activeTab, setActiveTab] = React.useState("informations")
  React.useEffect(() => {
    if (searchQuery) {
      const filtered = initialData.filter((student) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          student.studentcode?.toLowerCase().includes(searchLower) ||
          student.enname?.toLowerCase().includes(searchLower) ||
          student.khname?.toLowerCase().includes(searchLower) ||
          student.zhname?.toLowerCase().includes(searchLower) ||
          student.gender?.toLowerCase().includes(searchLower) ||
          student.status?.toLowerCase().includes(searchLower)
        )
      })
      setTableData(filtered)
    } else {
      setTableData(initialData)
    }
  }, [searchQuery, initialData])

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB")
      return
    }
    try {
      setIsUploading(true)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) throw new Error("Authentication required")
      const studentName = formData.enname || formData.khname || ""
      const photoUrl = await uploadPhoto(token, file, studentName)
      handleInputChange("photo", photoUrl)
      toast.success("Photo uploaded successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAdd = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormError(null)
    setFormData(emptyFormData)
    setOpen(true)
  }

  const handleView = (student: Student) => {
    setViewStudent(student)
  }

  const handleEdit = (student: Student) => {
    setIsEditing(true)
    setEditingId(Number(student.id))
    setFormError(null)
    setFormData({
      tenant_id: student.tenant_id,
      school_id: student.school_id,
      photo: student.photo,
      studentcode: student.studentcode,
      enname: student.enname,
      khname: student.khname,
      zhname: student.zhname,
      gender: student.gender,
      date_of_birth: student.date_of_birth,
      nationality: student.nationality,
      religion: student.religion,
      pob_province: student.pob_province,
      pob_district: student.pob_district,
      pob_commune: student.pob_commune,
      pob_village: student.pob_village,
      cur_province: student.cur_province,
      cur_district: student.cur_district,
      cur_commune: student.cur_commune,
      cur_village: student.cur_village,
      joinschool: student.joinschool,
      leftschool: student.leftschool,
      branchId: student.branchId,
      levelId: student.levelId,
      status: student.status?.toLowerCase() || "active",
      father_name: student.father_name || "",
      father_phone: student.father_phone || "",
      mother_name: student.mother_name || "",
      mother_phone: student.mother_phone || "",
    })
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        if (onDelete) {
          await onDelete(Number(deleteId))
          toast.success("Student deleted successfully")
        } else {
          setTableData((prev) => prev.filter((item) => item.id !== deleteId))
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete student")
      }
      setDeleteId(null)
    }
  }

  const handleSubmit = async () => {
    const toUndefined = (val: string): string | undefined => val || undefined
    const payload: StudentPayload = {
      tenant_id: toUndefined(formData.tenant_id),
      school_id: Number(formData.school_id) || undefined,
      branch_id: Number(formData.branchId) || undefined,
      level_id: Number(formData.levelId) || undefined,
      photo: toUndefined(formData.photo),
      studentcode: formData.studentcode,
      enname: formData.enname,
      khname: formData.khname,
      zhname: toUndefined(formData.zhname),
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      nationality: formData.nationality,
      religion: toUndefined(formData.religion),
      pob_province: toUndefined(formData.pob_province),
      pob_district: toUndefined(formData.pob_district),
      pob_commune: toUndefined(formData.pob_commune),
      pob_village: toUndefined(formData.pob_village),
      cur_province: toUndefined(formData.cur_province),
      cur_district: toUndefined(formData.cur_district),
      cur_commune: toUndefined(formData.cur_commune),
      cur_village: toUndefined(formData.cur_village),
      joinschool: toUndefined(formData.joinschool),
      leftschool: toUndefined(formData.leftschool),
      father_name: toUndefined(formData.father_name),
      father_phone: toUndefined(formData.father_phone),
      mother_name: toUndefined(formData.mother_name),
      mother_phone: toUndefined(formData.mother_phone),
      status: (formData.status?.toUpperCase() as "ACTIVE" | "INACTIVE") || undefined,
    }

    try {
      setIsSaving(true)
      setFormError(null)
      if (isEditing && editingId !== null) {
        if (onUpdate) {
          await onUpdate(editingId, payload)
          toast.success("Student updated successfully")
        } else {
          const existing = tableData.find((item) => item.id === String(editingId))
          if (!existing) {
            throw new Error("Student not found for local update")
          }
          const fallbackUpdated: Student = {
            ...existing,
            tenant_id: formData.tenant_id,
            studentcode: formData.studentcode,
            enname: formData.enname,
            khname: formData.khname,
            zhname: formData.zhname,
            gender: formData.gender,
            date_of_birth: formData.date_of_birth,
            nationality: formData.nationality,
            religion: formData.religion,
            pob_province: formData.pob_province,
            pob_district: formData.pob_district,
            pob_commune: formData.pob_commune,
            pob_village: formData.pob_village,
            cur_province: formData.cur_province,
            cur_district: formData.cur_district,
            cur_commune: formData.cur_commune,
            cur_village: formData.cur_village,
            joinschool: formData.joinschool,
            leftschool: formData.leftschool,
            branchId: formData.branchId,
            levelId: formData.levelId,
            status: formData.status as "active" | "inactive",
            father_name: formData.father_name,
            father_phone: formData.father_phone,
            mother_name: formData.mother_name,
            mother_phone: formData.mother_phone,
          }
          setTableData((prev) => prev.map((item) => (item.id === String(editingId) ? fallbackUpdated : item)))
        }
      } else {
        if (onCreate) {
          await onCreate(payload)
          toast.success("Student created successfully")
        } else {
          const fallbackCreated: Student = {
            id: String(Date.now()),
            user_id: "",
            tenant_id: formData.tenant_id,
            school_id: "",
            photo: formData.photo,
            studentcode: formData.studentcode,
            enname: formData.enname,
            khname: formData.khname,
            zhname: formData.zhname,
            gender: formData.gender,
            date_of_birth: formData.date_of_birth,
            nationality: formData.nationality,
            religion: formData.religion,
            pob_province: formData.pob_province,
            pob_district: formData.pob_district,
            pob_commune: formData.pob_commune,
            pob_village: formData.pob_village,
            cur_province: formData.cur_province,
            cur_district: formData.cur_district,
            cur_commune: formData.cur_commune,
            cur_village: formData.cur_village,
            joinschool: formData.joinschool,
            leftschool: formData.leftschool,
            branchId: formData.branchId,
            levelId: formData.levelId,
            status: formData.status as "active" | "inactive",
            father_name: formData.father_name,
            father_phone: formData.father_phone,
            mother_name: formData.mother_name,
            mother_phone: formData.mother_phone,
            createdAt: new Date().toISOString().split("T")[0],
          }
          setTableData((prev) => [...prev, fallbackCreated])
        }
      }
      setIsEditing(false)
      setEditingId(null)
      setOpen(false)
      setFormData(emptyFormData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save student"
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const actionColumn: ColumnDef<Student> = {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
            <IconPencil className="h-4 w-4" />
          </Button>
          {!hideDelete && (
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
              <IconTrash className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
    header: "Actions",
  }

  const selectColumn: ColumnDef<Student> = {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center p-1 w-full" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center p-1 w-full" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }

  const allColumns = React.useMemo(() => {
    const cols = (readOnly || hideActions) ? columns : [...columns, actionColumn]
    return [selectColumn, ...cols]
  }, [readOnly, hideActions, actionColumn])

  const table = useReactTable({
    data: tableData,
    columns: allColumns,
    meta: {
      branchMap: Object.fromEntries(branchOptions.map((b) => [b.id, b.enname ?? b.khname ?? "Unknown"])) as Record<string, string>,
      levelMap: Object.fromEntries(levelOptions.map((l) => [l.id, l.name])) as Record<string, string>,
      nationalityMap: Object.fromEntries(
        Object.entries(nationalitiesData.nationalities).map(([k, v]) => [
          k,
          language === "km" ? v.khmer : language === "zh" ? v.chinese : v.english,
        ])
      ) as Record<string, string>,
    } as StudentTableMeta,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      sorting,
      rowSelection,
    },
  })

  const EXPORT_COLUMNS = [
    { id: "studentcode", label: "Student Code" },
    { id: "enname", label: "English Name" },
    { id: "khname", label: "Khmer Name" },
    { id: "zhname", label: "Chinese Name" },
    { id: "gender", label: "Gender" },
    { id: "date_of_birth", label: "Date of Birth" },
    { id: "place_of_birth", label: "Place of Birth" },
    { id: "current_address", label: "Current Address" },
    { id: "nationality", label: "Nationality" },
    { id: "branch", label: "Branch" },
    { id: "level", label: "Level" },
    { id: "father_name", label: "Father Name" },
    { id: "father_phone", label: "Father Phone" },
    { id: "mother_name", label: "Mother Name" },
    { id: "mother_phone", label: "Mother Phone" },
    { id: "status", label: "Status" },
  ]

  const handleExportExcel = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows

    if (rowsToExport.length === 0) {
      toast.error("No records available to export")
      return
    }

    setExportDialogOpen(true)
  }

  const executeExportExcel = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows

    const activeCols = EXPORT_COLUMNS.filter(c => selectedExportCols[c.id])
    if (activeCols.length === 0) {
      toast.error("Please select at least one column to export")
      return
    }

    const headers = activeCols.map(c => c.label)

    const dataRows = rowsToExport.map(row => {
      const student = row.original
      const nationalityName = student.nationality 
        ? ((table.options.meta as any)?.nationalityMap?.[student.nationality.toLowerCase()] ?? student.nationality)
        : ""
      const branchName = (table.options.meta as any)?.branchMap?.[student.branchId] ?? "Unknown"
      const levelName = (table.options.meta as any)?.levelMap?.[student.levelId] ?? "Unknown"

      const getFieldValue = (colId: string) => {
        switch (colId) {
          case "studentcode": return student.studentcode || ""
          case "enname": return student.enname || ""
          case "khname": return student.khname || ""
          case "zhname": return student.zhname || ""
          case "gender": return student.gender || ""
          case "date_of_birth": return student.date_of_birth || ""
          case "place_of_birth": return [student.pob_village, student.pob_commune, student.pob_district, student.pob_province].filter(Boolean).join(", ")
          case "current_address": return [student.cur_village, student.cur_commune, student.cur_district, student.cur_province].filter(Boolean).join(", ")
          case "nationality": return nationalityName
          case "branch": return branchName
          case "level": return levelName
          case "father_name": return student.father_name || ""
          case "father_phone": return student.father_phone || ""
          case "mother_name": return student.mother_name || ""
          case "mother_phone": return student.mother_phone || ""
          case "status": return student.status || ""
          default: return ""
        }
      }

      return activeCols.map(c => getFieldValue(c.id))
    })

    const dataToExport = [headers, ...dataRows]

    // Create Worksheet & Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students")

    // Auto-fit column widths
    const maxValLen = dataToExport[0].map((_, colIdx) => 
      Math.max(...dataToExport.map(row => String(row[colIdx] || "").length))
    )
    worksheet["!cols"] = maxValLen.map(len => ({ wch: Math.max(len + 3, 10) }))

    // Save/Download file as .xlsx
    XLSX.writeFile(workbook, `students_export_${new Date().toISOString().split("T")[0]}.xlsx`)

    setExportDialogOpen(false)

    if (selectedRows.length > 0) {
      toast.success(`Exported ${selectedRows.length} selected record(s) to Excel`)
    } else {
      toast.success(`Exported all ${rowsToExport.length} record(s) to Excel`)
    }
  }

  return (
    <div className="w-full space-y-4">
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Excel</DialogTitle>
            <DialogDescription>Select the columns you want to include in the export.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {EXPORT_COLUMNS.map((col) => (
              <div key={col.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`export-col-${col.id}`} 
                  checked={selectedExportCols[col.id]} 
                  onCheckedChange={(checked) => setSelectedExportCols(prev => ({ ...prev, [col.id]: !!checked }))}
                />
                <label htmlFor={`export-col-${col.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {col.label}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter className="flex items-center sm:justify-between">
            <Button variant="ghost" onClick={() => {
              const allChecked = Object.values(selectedExportCols).every(Boolean)
              const newVal = !allChecked
              const newState = { ...selectedExportCols }
              for (const key in newState) newState[key] = newVal
              setSelectedExportCols(newState)
            }}>
              {Object.values(selectedExportCols).every(Boolean) ? "Deselect All" : "Select All"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
              <Button onClick={executeExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <IconTable className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} student(s)
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0 flex items-center justify-center border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 hover:text-emerald-700" onClick={handleExportExcel}>
                <IconTable className="h-4 w-4" />
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                {!hideAddButton && (
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" onClick={handleAdd} className="rounded-full px-5">
                      <IconPlus className="mr-1.5 h-4 w-4" />
                      Add New
                    </Button>
                  </DialogTrigger>
                )}
        <DialogContent className="sm:max-w-[800px] w-[90vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? t("table.edit", language) : t("table.addNew", language)}
                  </DialogTitle>
                  <DialogDescription>
                    Enter the student details below.
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-4">
                    <TabsTrigger value="informations">{t("tab.informations", language)}</TabsTrigger>
                    <TabsTrigger value="family">{t("tab.family", language)}</TabsTrigger>
                    <TabsTrigger value="pob">{t("tab.pob", language)}</TabsTrigger>
                    <TabsTrigger value="current">{t("tab.current", language)}</TabsTrigger>
                    <TabsTrigger value="status">{t("tab.status", language)}</TabsTrigger>
                  </TabsList>
                  <div className="min-h-[400px] max-h-[65vh] overflow-y-auto px-2">
                  <TabsContent value="informations" className="max-w-[900px] mx-auto w-full">
                    <div className="flex flex-col items-center gap-6 py-6">
                      <div className="relative">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-muted">
                          <img src={getImageUrl(formData.photo) || "/resources/avatar/non_pic.jpg"} alt="Student photo" className="w-full h-full object-cover cursor-pointer" onDoubleClick={() => { const a = document.createElement("a"); a.href = getImageUrl(formData.photo) || "/resources/avatar/non_pic.jpg"; a.download = ""; document.body.appendChild(a); a.click(); document.body.removeChild(a) }} />
                        </div>
                        
                        <label htmlFor="photo-upload-student" className="absolute bottom-0 right-0 cursor-pointer bg-primary text-primary-foreground rounded-full p-1.5 shadow hover:bg-primary/90">
                          <IconPencil className="h-3.5 w-3.5" />
                          <input id="photo-upload-student" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
                        </label>
                      </div>
                      {isUploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-6 py-6">
                      <div className="grid gap-2">
                        <Label htmlFor="tenant_id">{t("form.tenantId", language)}</Label>
                        <Input id="tenant_id" placeholder={t("form.tenantId", language)} value={formData.tenant_id} onChange={(e) => handleInputChange("tenant_id", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="school_id">School ID</Label>
                        <Input id="school_id" placeholder="School ID" value={formData.school_id} onChange={(e) => handleInputChange("school_id", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="studentcode">{t("form.studentCode", language)}</Label>
                        <Input id="studentcode" placeholder={t("form.studentCode", language)} value={formData.studentcode} onChange={(e) => handleInputChange("studentcode", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="enname">{t("form.englishName", language)}</Label>
                        <Input id="enname" placeholder={t("form.englishName", language)} value={formData.enname} onChange={(e) => handleInputChange("enname", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="khname">{t("form.khmerName", language)}</Label>
                        <Input id="khname" placeholder={t("form.khmerName", language)} value={formData.khname} onChange={(e) => handleInputChange("khname", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="zhname">{t("form.chineseName", language)}</Label>
                        <Input id="zhname" placeholder={t("form.chineseName", language)} value={formData.zhname} onChange={(e) => handleInputChange("zhname", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="gender">{t("form.gender", language)}</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.selectGender", language)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">{t("gender.male", language)}</SelectItem>
                            <SelectItem value="Female">{t("gender.female", language)}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="date_of_birth">{t("form.dob", language)}</Label>
                        <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => handleInputChange("date_of_birth", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="nationality">{t("form.nationality", language)}</Label>
                        <Select value={formData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.selectNationality", language)} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(nationalitiesData.nationalities).map(([key, nation]) => (
                              <SelectItem key={key} value={key}>
                                {language === "km" ? nation.khmer : language === "zh" ? nation.chinese : nation.english}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="religion">{t("form.religion", language)}</Label>
                        <Select value={formData.religion} onValueChange={(value) => handleInputChange("religion", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.selectReligion", language)} />
                          </SelectTrigger>
                          <SelectContent>
                            {religionsData.religions.map((religion) => (
                              <SelectItem key={religion.id} value={religion.name_en}>
                                {language === "km" ? religion.name_kh : religion.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="family" className="max-w-[900px] mx-auto w-full">
                    <div className="grid grid-cols-2 gap-6 py-6">
                      <div className="grid gap-2">
                        <Label htmlFor="father_name">{t("form.fatherName", language)}</Label>
                        <Input id="father_name" placeholder={t("form.fatherName", language)} value={formData.father_name} onChange={(e) => handleInputChange("father_name", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="father_phone">{t("form.fatherPhone", language)}</Label>
                        <Input id="father_phone" placeholder={t("form.fatherPhone", language)} value={formData.father_phone} onChange={(e) => handleInputChange("father_phone", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="mother_name">{t("form.motherName", language)}</Label>
                        <Input id="mother_name" placeholder={t("form.motherName", language)} value={formData.mother_name} onChange={(e) => handleInputChange("mother_name", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="mother_phone">{t("form.motherPhone", language)}</Label>
                        <Input id="mother_phone" placeholder={t("form.motherPhone", language)} value={formData.mother_phone} onChange={(e) => handleInputChange("mother_phone", e.target.value)} />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="pob" className="max-w-[900px] mx-auto w-full">
                    <div className="py-14">
                      <AddressSelect prefix="pob_" formData={formData} handleInputChange={handleInputChange} language={language} />
                    </div>
                  </TabsContent>
                  <TabsContent value="current" className="max-w-[900px] mx-auto w-full">
                    <div className="py-14">
                      <AddressSelect prefix="cur_" formData={formData} handleInputChange={handleInputChange} language={language} />
                    </div>
                  </TabsContent>
                  <TabsContent value="status" className="max-w-[900px] mx-auto w-full">
                    <div className="grid grid-cols-2 gap-12 py-10">
                      <div className="grid gap-2">
                        <Label htmlFor="joinschool">{t("form.joinSchool", language)}</Label>
                        <Input id="joinschool" type="date" value={formData.joinschool} onChange={(e) => handleInputChange("joinschool", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="leftschool">{t("form.leftSchool", language)}</Label>
                        <Input id="leftschool" type="date" value={formData.leftschool} onChange={(e) => handleInputChange("leftschool", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="branchId">{t("form.selectBranch", language)}</Label>
                        <Select value={formData.branchId} onValueChange={(value) => handleInputChange("branchId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.selectBranch", language)} />
                          </SelectTrigger>
                          <SelectContent>
                            {branchOptions.length > 0
                              ? branchOptions.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>{b.enname || b.khname || b.id}</SelectItem>
                                ))
                              : <SelectItem value="1">Main Branch</SelectItem>
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="levelId">{t("form.selectLevel", language)}</Label>
                        <Select value={formData.levelId} onValueChange={(value) => handleInputChange("levelId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.selectLevel", language)} />
                          </SelectTrigger>
                          <SelectContent>
                            {levelOptions.length > 0
                              ? levelOptions.map((l) => (
                                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                ))
                              : <>
                                  <SelectItem value="1">Kindergarten</SelectItem>
                                  <SelectItem value="2">Primary</SelectItem>
                                  <SelectItem value="3">Secondary</SelectItem>
                                </>
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2 col-span-2 md:col-span-1">
                        <Label htmlFor="status">{t("form.status", language)}</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.selectStatus", language)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">{t("form.active", language)}</SelectItem>
                            <SelectItem value="inactive">{t("form.inactive", language)}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  </div>
                </Tabs>

                {formError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? "Saving..." : isEditing ? "Update" : "Save"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </>
          )}
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="rounded-md border">
        <Table className="table-fixed" style={{ width: table.getCenterTotalSize(), minWidth: "100%" }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isCentered = ["select", "index", "photo"].includes(header.id)
                  return (
                    <TableHead 
                      key={header.id} 
                      className={`relative border-r last:border-r-0 ${header.column.getCanSort() ? "cursor-pointer select-none hover:bg-muted/50" : ""}`}
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div className={`flex items-center gap-1.5 whitespace-nowrap overflow-hidden ${isCentered ? "justify-center text-center" : ""}`}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <IconArrowUp className="h-3.5 w-3.5 text-foreground shrink-0" />,
                              desc: <IconArrowDown className="h-3.5 w-3.5 text-foreground shrink-0" />,
                            }[header.column.getIsSorted() as string] ?? (header.column.getCanSort() ? <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" /> : null)}
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
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              if (table.getRowModel().rows?.length) {
                return table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => handleView(row.original)}>
                    {row.getVisibleCells().map((cell) => {
                      const isCentered = ["select", "index", "photo"].includes(cell.column.id)
                      return (
                        <TableCell 
                          key={cell.id} 
                          style={{ width: cell.column.getSize() }} 
                          className={`border-r last:border-r-0 overflow-hidden text-ellipsis whitespace-nowrap ${isCentered ? "text-center" : ""}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                   </TableRow>
                 ))
              }
              if (isLoading) {
                return Array.from({ length: 5 }).map((_, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {Array.from({ length: allColumns.length }).map((_, cellIdx) => (
                      <TableCell key={cellIdx}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              }
              return (
                <TableRow>
                  <TableCell colSpan={allColumns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )
            })()}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
      <Dialog open={!!viewStudent} onOpenChange={(open) => { if (!open) setViewStudent(null) }}>
        <DialogContent className="max-w-[1000px] sm:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background/95 backdrop-blur z-50">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <IconUser className="h-4.5 w-4.5 text-primary" />
              </div>
              <span>Student Details - {viewStudent?.enname || viewStudent?.khname}</span>
            </DialogTitle>
          </DialogHeader>

          {viewStudent && (
            <div className="px-6 py-5 space-y-6">
              {/* Profile Header Block */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 rounded-2xl border shadow-sm relative overflow-hidden">
                <div className="w-24 h-24 rounded-2xl border-2 border-background shadow-md overflow-hidden shrink-0 bg-muted flex items-center justify-center relative z-10">
                  <img
                    src={getImageUrl(viewStudent.photo) || "/resources/avatar/non_pic.jpg"}
                    alt={viewStudent.enname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2 relative z-10">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h4 className="text-xl font-bold tracking-tight">{viewStudent.enname} {viewStudent.khname ? <span className="text-muted-foreground font-medium text-lg">({viewStudent.khname})</span> : ''}</h4>
                    <Badge variant={viewStudent.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px] px-2 py-0.5 shadow-sm">
                      {viewStudent.status || "ACTIVE"}
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground/80 font-medium bg-muted/50 inline-block px-2 py-0.5 rounded-md">Code: {viewStudent.studentcode || "—"}</p>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start pt-2">
                    <span className="flex items-center gap-1.5"><IconUser className="w-4 h-4 opacity-70"/> {viewStudent.gender || "—"}</span>
                    <span className="flex items-center gap-1.5"><IconStack className="w-4 h-4 opacity-70"/> {viewStudent.nationality === 'Local' ? 'Cambodian' : (viewStudent.nationality || "—")}</span>
                    <span className="flex items-center gap-1.5"><IconStack className="w-4 h-4 opacity-70"/> {viewStudent.religion || "—"}</span>
                    <span className="flex items-center gap-1.5"><IconCalendar className="w-4 h-4 opacity-70"/> {viewStudent.date_of_birth || "—"}</span>
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
                    <InfoRow label="Join School" value={viewStudent.joinschool} />
                    <InfoRow label="Left School" value={viewStudent.leftschool} />
                    <InfoRow label="Level ID" value={viewStudent.level_id ? String(viewStudent.level_id) : undefined} />
                    <InfoRow label="Branch ID" value={viewStudent.branch_id ? String(viewStudent.branch_id) : undefined} />
                    <InfoRow label="Tenant ID" value={viewStudent.tenant_id ? String(viewStudent.tenant_id) : undefined} />
                    <InfoRow label="Chinese Name" value={viewStudent.zhname} />
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
                    <InfoRow label="Father Name" value={viewStudent.father_name} />
                    <InfoRow label="Father Phone" value={viewStudent.father_phone} />
                    <InfoRow label="Mother Name" value={viewStudent.mother_name} />
                    <InfoRow label="Mother Phone" value={viewStudent.mother_phone} />
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
                    <InfoRow label="Province" value={viewStudent.pob_province} />
                    <InfoRow label="District" value={viewStudent.pob_district} />
                    <InfoRow label="Commune" value={viewStudent.pob_commune} />
                    <InfoRow label="Village" value={viewStudent.pob_village} />
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
                    <InfoRow label="Province" value={viewStudent.cur_province} />
                    <InfoRow label="District" value={viewStudent.cur_district} />
                    <InfoRow label="Commune" value={viewStudent.cur_commune} />
                    <InfoRow label="Village" value={viewStudent.cur_village} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button size="sm" variant="outline" onClick={() => setViewStudent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)} variant="outline">No</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} variant="destructive">Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
