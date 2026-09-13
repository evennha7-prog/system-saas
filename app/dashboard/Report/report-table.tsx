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
import { IconPlus, IconPencil, IconTrash, IconAlertTriangle, IconArrowsSort, IconArrowUp, IconArrowDown, IconFileSpreadsheet, IconCheck, IconX } from "@tabler/icons-react"

import { Report, columns } from "./columns"
import { translations, t } from "@/lib/translations"
import { AUTH_TOKEN_KEY, type ReportPayload } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import type { Branch } from "@/app/dashboard/Branch/columns"
import { toast } from "sonner"

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

interface ReportTableProps {
  data: Report[]
  branchOptions?: Branch[]
  teacherOptions?: { id: string; name: string }[]
  studentOptions?: { id: string; name: string }[]
  searchQuery?: string
  isLoading?: boolean
  error?: string | null
  readOnly?: boolean
  hideDelete?: boolean
  onCreate?: (payload: ReportPayload) => Promise<void>
  onUpdate?: (id: number, payload: Partial<ReportPayload>) => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

interface ReportFormData {
  id: string
  title: string
  type: string
  branchId: string
  teacherId: string
  studentId: string
  score: string
  date: string
  schoolId: string
  status: string
  description: string
  notes: string
}

const emptyFormData: ReportFormData = {
  id: "",
  title: "",
  type: "academic",
  branchId: "",
  teacherId: "",
  studentId: "",
  score: "0",
  date: new Date().toISOString().split("T")[0],
  schoolId: "1",
  status: "draft",
  description: "",
  notes: "",
}

export function ReportTable({
  data: initialData,
  branchOptions = [],
  teacherOptions = [],
  studentOptions = [],
  searchQuery = "",
  isLoading = false,
  error = null,
  readOnly = false,
  hideDelete = false,
  onCreate,
  onUpdate,
  onDelete,
}: ReportTableProps) {
  const language = useLanguage()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [tableData, setTableData] = React.useState<Report[]>(initialData)
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<ReportFormData>(emptyFormData)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("informations")
  const [exportOpen, setExportOpen] = React.useState(false)
  const [exportColumns, setExportColumns] = React.useState<Record<string, boolean>>({
    title: true,
    type: true,
    branchId: true,
    teacherId: true,
    studentId: true,
    score: true,
    date: true,
    status: true,
    description: true,
    notes: true,
  })

  React.useEffect(() => {
    if (open) {
      setActiveTab("informations")
    }
  }, [open])

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = initialData.filter((report) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          report.title?.toLowerCase().includes(searchLower) ||
          report.type?.toLowerCase().includes(searchLower) ||
          report.status?.toLowerCase().includes(searchLower)
        )
      })
      setTableData(filtered)
    } else {
      setTableData(initialData)
    }
  }, [searchQuery, initialData])

  const handleInputChange = (field: keyof ReportFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdd = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormError(null)
    setFormData(emptyFormData)
    setOpen(true)
  }

  const handleEdit = (report: Report) => {
    setIsEditing(true)
    setEditingId(Number(report.id))
    setFormError(null)
    setFormData({
      id: report.id,
      title: report.title,
      type: report.type,
      branchId: report.branchId,
      teacherId: report.teacherId,
      studentId: report.studentId,
      score: String(report.score),
      date: report.date,
      schoolId: report.schoolId,
      status: report.status,
      description: report.description || "",
      notes: report.notes || "",
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
    const payload: ReportPayload = {
      school_id: Number(formData.schoolId) || 1,
      title: formData.title,
      type: formData.type as "academic" | "behavior" | "progress",
      score: formData.score ? Number(formData.score) : undefined,
      date: formData.date,
      status: formData.status as "draft" | "published" | "archived" | undefined,
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    }
    if (formData.branchId) {
      payload.branch_id = Number(formData.branchId)
    }
    if (formData.teacherId) {
      payload.teacher_id = Number(formData.teacherId)
    }
    if (formData.studentId) {
      payload.student_id = Number(formData.studentId)
    }

    try {
      setIsSaving(true)
      setFormError(null)
      if (isEditing && editingId !== null) {
        if (onUpdate) {
          await onUpdate(editingId, payload)
        } else {
          const existing = tableData.find((item) => item.id === String(editingId))
          if (!existing) {
            throw new Error("Report not found for local update")
          }
          const fallbackUpdated: Report = {
            ...existing,
            title: formData.title,
            type: formData.type as "academic" | "behavior" | "progress",
            branchId: formData.branchId,
            teacherId: formData.teacherId,
            studentId: formData.studentId,
            score: Number(formData.score),
            date: formData.date,
            status: formData.status as "draft" | "published" | "archived",
            description: formData.description,
            notes: formData.notes,
          }
          setTableData((prev) => prev.map((item) => (item.id === String(editingId) ? fallbackUpdated : item)))
        }
      } else {
        if (onCreate) {
          await onCreate(payload)
        } else {
          const fallbackCreated: Report = {
            id: String(Date.now()),
            title: formData.title,
            type: formData.type as "academic" | "behavior" | "progress",
            branchId: formData.branchId,
            teacherId: formData.teacherId,
            studentId: formData.studentId,
            score: Number(formData.score),
            date: formData.date,
            schoolId: formData.schoolId,
            status: formData.status as "draft" | "published" | "archived",
            description: formData.description,
            notes: formData.notes,
          }
          setTableData((prev) => [...prev, fallbackCreated])
        }
      }
      setOpen(false)
      setFormData(emptyFormData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save report"
      setFormError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const selectedColumns = Object.entries(exportColumns)
      .filter(([, checked]) => checked)
      .map(([key]) => key)

    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column to export")
      return
    }

    const columnDefs = columns as Array<{ accessorKey?: string; header: string }>
    const headers = columnDefs
      .filter((col) => col.accessorKey && selectedColumns.includes(col.accessorKey))
      .map((col) => col.header)

    const rows = tableData.map((report) =>
      selectedColumns.map((key) => {
        const value = report[key as keyof Report]
        if (key === "branchId") return branchMap[value as string] ?? "Unknown"
        if (key === "teacherId") return teacherMap[value as string] ?? "Unknown"
        if (key === "studentId") return studentMap[value as string] ?? "Unknown"
        return value ?? ""
      })
    )

    const dataToExport = [headers, ...rows]

    // Create Worksheet & Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports")

    // Auto-fit column widths
    const maxValLen = dataToExport[0].map((_, colIdx) => 
      Math.max(...dataToExport.map(row => String(row[colIdx] || "").length))
    )
    worksheet["!cols"] = maxValLen.map(len => ({ wch: Math.max(len + 3, 10) }))

    // Save/Download file as .xlsx
    XLSX.writeFile(workbook, `reports-${new Date().toISOString().split("T")[0]}.xlsx`)

    setExportOpen(false)
    toast.success("Exported successfully")
  }

  const toggleExportColumn = (key: string) => {
    setExportColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const selectAllExportColumns = () => {
    setExportColumns((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, true])))
  }

  const deselectAllExportColumns = () => {
    setExportColumns((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, false])))
  }

  const exportColumnOptions = [
    { key: "title", label: "Report Title" },
    { key: "type", label: "Type" },
    { key: "branchId", label: "Branch" },
    { key: "teacherId", label: "Teacher" },
    { key: "studentId", label: "Student" },
    { key: "score", label: "Score" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
    { key: "description", label: "Description" },
    { key: "notes", label: "Notes" },
  ] as const

  const branchMap = Object.fromEntries(branchOptions.map((b) => [b.id, b.enname ?? b.khname ?? "Unknown"]))
  const teacherMap = Object.fromEntries(teacherOptions.map((t) => [t.id, t.name]))
  const studentMap = Object.fromEntries(studentOptions.map((s) => [s.id, s.name]))

  const actionColumn: ColumnDef<Report> = {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex items-center gap-2">
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

  const allColumns = readOnly ? columns : [...columns, actionColumn]

  const table = useReactTable({
    data: tableData,
    columns: allColumns,
    meta: {
      branchMap,
      teacherMap,
      studentMap,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      sorting,
    },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} report(s)
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0 flex items-center justify-center border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 hover:text-emerald-700">
                    <IconFileSpreadsheet className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Export to Excel</DialogTitle>
                    <DialogDescription>
                      Select columns to include in the export
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-4 max-h-64 overflow-y-auto">
                    {exportColumnOptions.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`export-${key}`} className="cursor-pointer font-normal">
                          {label}
                        </Label>
                        <input
                          id={`export-${key}`}
                          type="checkbox"
                          checked={exportColumns[key]}
                          onChange={() => toggleExportColumn(key)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <Button variant="ghost" size="sm" onClick={selectAllExportColumns}>
                      <IconCheck className="mr-1.5 h-3.5 w-3.5" />
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={deselectAllExportColumns}>
                      <IconX className="mr-1.5 h-3.5 w-3.5" />
                      Deselect All
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
                    <Button onClick={handleExport} disabled={Object.values(exportColumns).every((v) => !v)}>
                      <IconFileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                      Export
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" onClick={handleAdd} className="rounded-full px-5">
                    <IconPlus className="mr-1.5 h-4 w-4" />
                    Add New
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? t("table.edit", language) : t("table.addNew", language)}
                  </DialogTitle>
                  <DialogDescription>
                    Enter the report details below.
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-h-[440px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="informations">Informations</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="informations">
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="school_id">School ID</Label>
                        <Input id="school_id" type="number" placeholder="School ID" value={formData.schoolId} onChange={(e) => handleInputChange("schoolId", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title">Report Title</Label>
                        <Input id="title" placeholder="Enter report title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="behavior">Behavior</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="score">Score</Label>
                        <Input id="score" type="number" placeholder="Enter score" value={formData.score} onChange={(e) => handleInputChange("score", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange("date", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="branchId">Branch</Label>
                        <Select value={formData.branchId} onValueChange={(value) => handleInputChange("branchId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
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
                        <Label htmlFor="teacherId">Teacher</Label>
                        <Select value={formData.teacherId} onValueChange={(value) => handleInputChange("teacherId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teacherOptions.length > 0
                              ? teacherOptions.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))
                              : <SelectItem value="1">Teacher 1</SelectItem>
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="studentId">Student</Label>
                        <Select value={formData.studentId} onValueChange={(value) => handleInputChange("studentId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {studentOptions.length > 0
                              ? studentOptions.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))
                              : <SelectItem value="1">Student 1</SelectItem>
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" placeholder="Enter description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input id="notes" placeholder="Enter notes" value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} />
                      </div>
                    </div>
                  </TabsContent>
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
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="border-r last:border-r-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
