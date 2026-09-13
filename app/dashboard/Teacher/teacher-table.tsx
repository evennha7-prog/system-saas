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

import { Teacher, columns } from "./columns"
import { translations, t } from "@/lib/translations"
import religionsData from "@/app/Religions/religions.json"
import nationalitiesData from "@/app/nationalities-Json/nationalities.json"
import { AUTH_TOKEN_KEY, ApiEmployee, EmployeePayload, createEmployee, deleteEmployee, getEmployees, updateEmployee, uploadPhoto, getImageUrl } from "@/lib/api"
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

interface TeacherTableProps {
  data: Teacher[]
  branchOptions?: Branch[]
  searchQuery?: string
  isLoading?: boolean
  error?: string | null
  hideAddButton?: boolean
  hideActions?: boolean
  hideDelete?: boolean
  onCreate?: (payload: EmployeePayload) => Promise<void>
  onUpdate?: (id: number, payload: Partial<EmployeePayload>) => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

interface TeacherFormData {
  [key: string]: string
  user_id: string
  tenant_id: string
  school_id: string
  photo: string
  teachercode: string
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
  joinwork: string
  leftwork: string
  branchId: string
  subject: string
  status: string
  father_name: string
  father_phone: string
  mother_name: string
  mother_phone: string
}

const emptyFormData: TeacherFormData = {
  user_id: "",
  tenant_id: "",
  school_id: "1",
  photo: "",
  teachercode: "",
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
  joinwork: "",
  leftwork: "",
  branchId: "",
  subject: "",
  status: "active",
  father_name: "",
  father_phone: "",
  mother_name: "",
  mother_phone: "",
}

export function TeacherTable({
  data: initialData,
  searchQuery = "",
  isLoading = false,
  error = null,
  branchOptions = [],
  readOnly = false,
  hideAddButton = false,
  hideActions = false,
  hideDelete = false,
  onCreate,
  onUpdate,
  onDelete,
}: TeacherTableProps & { readOnly?: boolean; hideAddButton?: boolean }) {
  const language = useLanguage()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [tableData, setTableData] = React.useState<Teacher[]>(initialData)
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)
  const [selectedExportCols, setSelectedExportCols] = React.useState<Record<string, boolean>>({
    teachercode: true,
    enname: true,
    khname: true,
    zhname: true,
    gender: true,
    date_of_birth: true,
    place_of_birth: true,
    current_address: true,
    nationality: true,
    subject: true,
    branchId: true,
    status: true,
  })
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<TeacherFormData>(emptyFormData)
  const [isUploading, setIsUploading] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [viewTeacher, setViewTeacher] = React.useState<Teacher | null>(null)
  const [activeTab, setActiveTab] = React.useState("informations")

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = initialData.filter((teacher) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          teacher.teachercode?.toLowerCase().includes(searchLower) ||
          teacher.enname?.toLowerCase().includes(searchLower) ||
          teacher.khname?.toLowerCase().includes(searchLower) ||
          teacher.zhname?.toLowerCase().includes(searchLower) ||
          teacher.gender?.toLowerCase().includes(searchLower) ||
          teacher.subject?.toLowerCase().includes(searchLower) ||
          teacher.status?.toLowerCase().includes(searchLower)
        )
      })
      setTableData(filtered)
    } else {
      setTableData(initialData)
    }
  }, [searchQuery, initialData])

  const handleInputChange = (field: keyof TeacherFormData, value: string) => {
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
      const teacherName = formData.enname || formData.khname || ""
      const photoUrl = await uploadPhoto(token, file, teacherName)
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

  const handleEdit = (teacher: Teacher) => {
    setIsEditing(true)
    setEditingId(Number(teacher.id))
    setFormError(null)
    setFormData({
      user_id: teacher.user_id,
      tenant_id: teacher.tenant_id,
      school_id: teacher.school_id,
      photo: teacher.photo,
      teachercode: teacher.teachercode,
      enname: teacher.enname,
      khname: teacher.khname,
      zhname: teacher.zhname,
      gender: teacher.gender,
      date_of_birth: teacher.date_of_birth,
      nationality: teacher.nationality,
      religion: teacher.religion,
      pob_province: teacher.pob_province,
      pob_district: teacher.pob_district,
      pob_commune: teacher.pob_commune,
      pob_village: teacher.pob_village,
      cur_province: teacher.cur_province,
      cur_district: teacher.cur_district,
      cur_commune: teacher.cur_commune,
      cur_village: teacher.cur_village,
      joinwork: teacher.joinwork,
      leftwork: teacher.leftwork,
      branchId: teacher.branchId,
      subject: teacher.subject,
      status: teacher.status,
      father_name: teacher.father_name || "",
      father_phone: teacher.father_phone || "",
      mother_name: teacher.mother_name || "",
      mother_phone: teacher.mother_phone || "",
    })
    setOpen(true)
  }

  const handleView = (teacher: Teacher) => {
    setViewTeacher(teacher)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        if (onDelete) {
          await onDelete(Number(deleteId))
          setTableData((prev) => prev.filter((item) => item.id !== deleteId))
        } else {
          setTableData((prev) => prev.filter((item) => item.id !== deleteId))
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete")
      }
      setDeleteId(null)
    }
  }

  const handleSubmit = async () => {
    const toUndefined = (val: string): string | undefined => val || undefined
    const payload: EmployeePayload = {
      tenant_id: toUndefined(formData.tenant_id),
      school_id: Number(formData.school_id) || 1,
      branch_id: Number(formData.branchId) || 1,
      photo: toUndefined(formData.photo),
      teachercode: formData.teachercode,
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
      joinwork: formData.joinwork,
      leftwork: toUndefined(formData.leftwork),
      is_active: formData.status === "active",
      father_name: toUndefined(formData.father_name),
      father_phone: toUndefined(formData.father_phone),
      mother_name: toUndefined(formData.mother_name),
      mother_phone: toUndefined(formData.mother_phone),
    }

    try {
      setIsSaving(true)
      setFormError(null)
      if (isEditing && editingId !== null) {
        if (onUpdate) {
          await onUpdate(editingId, payload)
          toast.success("Teacher updated successfully")
        } else {
          const existing = tableData.find((item) => item.id === String(editingId))
          if (!existing) {
            throw new Error("Teacher not found for local update")
          }
          const fallbackUpdated: Teacher = {
            ...existing,
            tenant_id: formData.tenant_id,
            teachercode: formData.teachercode,
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
            joinwork: formData.joinwork,
            leftwork: formData.leftwork,
            branchId: formData.branchId,
            subject: formData.subject,
            status: formData.status as "active" | "inactive" | "on_leave",
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
          toast.success("Teacher created successfully")
        } else {
          const fallbackCreated: Teacher = {
            id: String(Date.now()),
            user_id: "",
            tenant_id: formData.tenant_id,
            school_id: "",
            photo: formData.photo,
            teachercode: formData.teachercode,
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
            joinwork: formData.joinwork,
            leftwork: formData.leftwork,
            branchId: formData.branchId,
            subject: formData.subject,
            status: formData.status as "active" | "inactive" | "on_leave",
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
      const message = err instanceof Error ? err.message : "Failed to save teacher"
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const actionColumn: ColumnDef<Teacher> = {
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

  const selectColumn: ColumnDef<Teacher> = {
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
    { id: "teachercode", label: "Teacher Code" },
    { id: "enname", label: "English Name" },
    { id: "khname", label: "Khmer Name" },
    { id: "zhname", label: "Chinese Name" },
    { id: "gender", label: "Gender" },
    { id: "date_of_birth", label: "Date of Birth" },
    { id: "place_of_birth", label: "Place of Birth" },
    { id: "current_address", label: "Current Address" },
    { id: "nationality", label: "Nationality" },
    { id: "subject", label: "Subject" },
    { id: "branchId", label: "Branch" },
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
      const teacher = row.original

      const getFieldValue = (colId: string) => {
        switch (colId) {
          case "teachercode": return teacher.teachercode || ""
          case "enname": return teacher.enname || ""
          case "khname": return teacher.khname || ""
          case "zhname": return teacher.zhname || ""
          case "gender": return teacher.gender || ""
          case "date_of_birth": return teacher.date_of_birth || ""
          case "place_of_birth": return [teacher.pob_village, teacher.pob_commune, teacher.pob_district, teacher.pob_province].filter(Boolean).join(", ")
          case "current_address": return [teacher.cur_village, teacher.cur_commune, teacher.cur_district, teacher.cur_province].filter(Boolean).join(", ")
          case "nationality": return teacher.nationality || ""
          case "subject": return teacher.subject || ""
          case "branchId": return teacher.branchId || ""
          case "status": return teacher.status || ""
          default: return ""
        }
      }

      return activeCols.map(c => getFieldValue(c.id))
    })

    const dataToExport = [headers, ...dataRows]

    // Create Worksheet & Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers")

    // Auto-fit column widths
    const maxValLen = dataToExport[0].map((_, colIdx) => 
      Math.max(...dataToExport.map(row => String(row[colIdx] || "").length))
    )
    worksheet["!cols"] = maxValLen.map(len => ({ wch: Math.max(len + 3, 10) }))

    // Save/Download file as .xlsx
    XLSX.writeFile(workbook, `teachers_export_${new Date().toISOString().split("T")[0]}.xlsx`)

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
                  id={`export-col-teacher-${col.id}`} 
                  checked={selectedExportCols[col.id]} 
                  onCheckedChange={(checked) => setSelectedExportCols(prev => ({ ...prev, [col.id]: !!checked }))}
                />
                <label htmlFor={`export-col-teacher-${col.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
          {table.getFilteredRowModel().rows.length} teacher(s)
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
                    Enter the teacher details below.
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
                          <img src={getImageUrl(formData.photo) || "/resources/avatar/non-pic1.png"} alt="Teacher photo" className="w-full h-full object-cover cursor-pointer" onDoubleClick={() => { const a = document.createElement("a"); a.href = getImageUrl(formData.photo) || "/resources/avatar/non-pic1.png"; a.download = ""; document.body.appendChild(a); a.click(); document.body.removeChild(a) }} />
                        </div>
                        
                        <label htmlFor="photo-upload-teacher" className="absolute bottom-0 right-0 cursor-pointer bg-primary text-primary-foreground rounded-full p-1.5 shadow hover:bg-primary/90">
                          <IconPencil className="h-3.5 w-3.5" />
                          <input id="photo-upload-teacher" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
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
                        <Label htmlFor="teachercode">{t("form.teacherCode", language)}</Label>
                        <Input id="teachercode" placeholder={t("form.teacherCode", language)} value={formData.teachercode} onChange={(e) => handleInputChange("teachercode", e.target.value)} />
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
                      <div className="grid gap-2">
                        <Label htmlFor="subject">{t("form.subject", language)}</Label>
                        <Input id="subject" placeholder={t("form.subject", language)} value={formData.subject} onChange={(e) => handleInputChange("subject", e.target.value)} />
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
                        <Label htmlFor="joinwork">{t("form.joinWork", language)}</Label>
                        <Input id="joinwork" type="date" value={formData.joinwork} onChange={(e) => handleInputChange("joinwork", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="leftwork">{t("form.leftWork", language)}</Label>
                        <Input id="leftwork" type="date" value={formData.leftwork} onChange={(e) => handleInputChange("leftwork", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="branchId">{t("form.selectBranch", language)}</Label>
                        <Select value={formData.branchId} onValueChange={(value) => handleInputChange("branchId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.selectBranch", language)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Main Campus</SelectItem>
                            <SelectItem value="2">Branch 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
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

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? "Saving..." : isEditing ? "Update" : "Save"}</Button>
                </DialogFooter>
                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
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
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {Array.from({ length: allColumns.length }).map((_, cellIdx) => (
                    <TableCell key={cellIdx}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
      <Dialog open={!!viewTeacher} onOpenChange={(open) => { if (!open) setViewTeacher(null) }}>
        <DialogContent className="max-w-[1000px] sm:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background/95 backdrop-blur z-50">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <IconUsers className="h-4.5 w-4.5 text-primary" />
              </div>
              <span>Teacher Details - {viewTeacher?.enname || viewTeacher?.khname}</span>
            </DialogTitle>
          </DialogHeader>

          {viewTeacher && (
            <div className="px-6 py-5 space-y-6">
              {/* Profile Header Block */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 rounded-2xl border shadow-sm relative overflow-hidden">
                <div className="w-24 h-24 rounded-2xl border-2 border-background shadow-md overflow-hidden shrink-0 bg-muted flex items-center justify-center relative z-10">
                  <img
                    src={getImageUrl(viewTeacher.photo) || "/resources/avatar/non-pic1.png"}
                    alt={viewTeacher.enname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2 relative z-10">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h4 className="text-xl font-bold tracking-tight">{viewTeacher.enname} {viewTeacher.khname ? <span className="text-muted-foreground font-medium text-lg">({viewTeacher.khname})</span> : ''}</h4>
                    <Badge variant={viewTeacher.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px] px-2 py-0.5 shadow-sm">
                      {viewTeacher.status || "ACTIVE"}
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground/80 font-medium bg-muted/50 inline-block px-2 py-0.5 rounded-md">Code: {viewTeacher.teachercode || "—"}</p>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start pt-2">
                    <span className="flex items-center gap-1.5"><IconUser className="w-4 h-4 opacity-70"/> {viewTeacher.gender || "—"}</span>
                    <span className="flex items-center gap-1.5"><IconStack className="w-4 h-4 opacity-70"/> {viewTeacher.nationality || "—"}</span>
                    <span className="flex items-center gap-1.5"><IconStack className="w-4 h-4 opacity-70"/> {viewTeacher.religion || "—"}</span>
                    <span className="flex items-center gap-1.5"><IconCalendar className="w-4 h-4 opacity-70"/> {viewTeacher.date_of_birth || "—"}</span>
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
                    <InfoRow label="Join Work" value={viewTeacher.joinwork} />
                    <InfoRow label="Left Work" value={viewTeacher.leftwork} />
                    <InfoRow label="Branch ID" value={viewTeacher.branchId ? String(viewTeacher.branchId) : undefined} />
                    <InfoRow label="Tenant ID" value={viewTeacher.tenant_id ? String(viewTeacher.tenant_id) : undefined} />
                    <InfoRow label="Subject" value={viewTeacher.subject} />
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
                    <InfoRow label="Father Name" value={viewTeacher.father_name} />
                    <InfoRow label="Father Phone" value={viewTeacher.father_phone} />
                    <InfoRow label="Mother Name" value={viewTeacher.mother_name} />
                    <InfoRow label="Mother Phone" value={viewTeacher.mother_phone} />
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
                    <InfoRow label="Province" value={viewTeacher.pob_province} />
                    <InfoRow label="District" value={viewTeacher.pob_district} />
                    <InfoRow label="Commune" value={viewTeacher.pob_commune} />
                    <InfoRow label="Village" value={viewTeacher.pob_village} />
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
                    <InfoRow label="Province" value={viewTeacher.cur_province} />
                    <InfoRow label="District" value={viewTeacher.cur_district} />
                    <InfoRow label="Commune" value={viewTeacher.cur_commune} />
                    <InfoRow label="Village" value={viewTeacher.cur_village} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button size="sm" variant="outline" onClick={() => setViewTeacher(null)}>Close</Button>
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
              This action cannot be undone. This will permanently delete the record.
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
