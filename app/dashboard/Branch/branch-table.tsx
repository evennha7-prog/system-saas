"use client"

import * as React from "react"
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
import { IconPlus, IconPencil, IconTrash, IconAlertTriangle, IconArrowsSort, IconArrowUp, IconArrowDown } from "@tabler/icons-react"

import { Branch, columns } from "./columns"
import { translations, t } from "@/lib/translations"
import { Skeleton } from "@/components/ui/skeleton"
import { AUTH_TOKEN_KEY, type BranchPayload } from "@/lib/api"
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

interface BranchTableProps {
  data: Branch[]
  searchQuery?: string
  isLoading?: boolean
  error?: string | null
  readOnly?: boolean
  hideAddButton?: boolean
  hideActions?: boolean
  hideDelete?: boolean
  onCreate?: (payload: BranchPayload) => Promise<void>
  onUpdate?: (id: number, payload: Partial<BranchPayload>) => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

interface BranchFormData {
  id: string
  tenant_id: string
  khname: string
  enname: string
  zhname: string
  school_id: string
  student_code_prefix: string
  student_code_suffix: string
  student_code_digit: string
  status: string
}

const emptyFormData: BranchFormData = {
  id: "",
  tenant_id: "",
  khname: "",
  enname: "",
  zhname: "",
  school_id: "",
  student_code_prefix: "",
  student_code_suffix: "",
  student_code_digit: "",
  status: "active",
}

export function BranchTable({
  data: initialData,
  searchQuery = "",
  isLoading = false,
  error = null,
  readOnly = false,
  hideAddButton = false,
  hideActions = false,
  hideDelete = false,
  onCreate,
  onUpdate,
  onDelete,
}: BranchTableProps) {
  const language = useLanguage()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [tableData, setTableData] = React.useState<Branch[]>(initialData)
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<BranchFormData>(emptyFormData)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("informations")

  React.useEffect(() => {
    if (open) {
      setActiveTab("informations")
    }
  }, [open])

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = initialData.filter((branch) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          branch.enname?.toLowerCase().includes(searchLower) ||
          branch.khname?.toLowerCase().includes(searchLower) ||
          branch.zhname?.toLowerCase().includes(searchLower) ||
          branch.status?.toLowerCase().includes(searchLower)
        )
      })
      setTableData(filtered)
    } else {
      setTableData(initialData)
    }
  }, [searchQuery, initialData])

  const handleInputChange = (field: keyof BranchFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdd = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormError(null)
    setFormData(emptyFormData)
    setOpen(true)
  }

  const handleEdit = (branch: Branch) => {
    setIsEditing(true)
    setEditingId(Number(branch.id))
    setFormError(null)
    setFormData({
      id: branch.id,
      tenant_id: branch.tenant_id ?? "",
      khname: branch.khname ?? "",
      enname: branch.enname ?? "",
      zhname: branch.zhname ?? "",
      school_id: branch.school_id ?? "1",
      student_code_prefix: branch.student_code_prefix,
      student_code_suffix: branch.student_code_suffix,
      student_code_digit: branch.student_code_digit,
      status: branch.status,
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
    const payload: BranchPayload = {
      tenant_id: formData.tenant_id || undefined,
      khname: formData.khname,
      enname: formData.enname,
      zhname: formData.zhname || undefined,
      student_code_prefix: formData.student_code_prefix,
      student_code_suffix: formData.student_code_suffix,
      student_code_digit: formData.student_code_digit ? Number(formData.student_code_digit) : undefined,
      status: formData.status as "active" | "inactive" | undefined,
    }
    if (formData.school_id) {
      payload.school_id = Number(formData.school_id)
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
            throw new Error("Branch not found for local update")
          }
          const fallbackUpdated: Branch = {
            ...existing,
            tenant_id: formData.tenant_id,
            khname: formData.khname,
            enname: formData.enname,
            zhname: formData.zhname,
            school_id: formData.school_id,
            student_code_prefix: formData.student_code_prefix,
            student_code_suffix: formData.student_code_suffix,
            student_code_digit: formData.student_code_digit,
            status: formData.status as "active" | "inactive",
          }
          setTableData((prev) => prev.map((item) => (item.id === String(editingId) ? fallbackUpdated : item)))
        }
      } else {
        if (onCreate) {
          await onCreate(payload)
        } else {
          const fallbackCreated: Branch = {
            id: String(Date.now()),
            tenant_id: formData.tenant_id,
            khname: formData.khname,
            enname: formData.enname,
            zhname: formData.zhname,
            school_id: formData.school_id,
            student_code_prefix: formData.student_code_prefix,
            student_code_suffix: formData.student_code_suffix,
            student_code_digit: formData.student_code_digit,
            status: formData.status as "active" | "inactive",
            createdAt: new Date().toISOString().split("T")[0],
          }
          setTableData((prev) => [...prev, fallbackCreated])
        }
      }
      setOpen(false)
      setFormData(emptyFormData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save branch"
      setFormError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const actionColumn: ColumnDef<Branch> = {
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

  const allColumns = (readOnly || hideActions) ? columns : [...columns, actionColumn]

  const table = useReactTable({
    data: tableData,
    columns: allColumns,
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
          {table.getFilteredRowModel().rows.length} branch(es)
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <Dialog open={open} onOpenChange={setOpen}>
              {!hideAddButton && (
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" onClick={handleAdd} className="rounded-full px-5">
                    <IconPlus className="mr-1.5 h-4 w-4" />
                    Add New
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? t("table.edit", language) : t("table.addNew", language)}
                  </DialogTitle>
                  <DialogDescription>
                    Enter the branch details below.
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-h-[380px]">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="informations">Informations</TabsTrigger>
                    <TabsTrigger value="student_code">Student Code</TabsTrigger>
                    <TabsTrigger value="status">Status</TabsTrigger>
                  </TabsList>

                  <TabsContent value="informations">
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tenant_id">{t("form.tenantId", language)}</Label>
                        <Input id="tenant_id" placeholder={t("form.tenantId", language)} value={formData.tenant_id} onChange={(e) => handleInputChange("tenant_id", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="school_id">School ID</Label>
                        <Input id="school_id" type="number" placeholder="School ID" value={formData.school_id} onChange={(e) => handleInputChange("school_id", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="khname">Khmer Name</Label>
                        <Input id="khname" placeholder="Enter Khmer name" value={formData.khname} onChange={(e) => handleInputChange("khname", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="enname">English Name</Label>
                        <Input id="enname" placeholder="Enter English name" value={formData.enname} onChange={(e) => handleInputChange("enname", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="zhname">Chinese Name</Label>
                        <Input id="zhname" placeholder="Enter Chinese name" value={formData.zhname} onChange={(e) => handleInputChange("zhname", e.target.value)} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="student_code">
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="student_code_prefix">Student Code Prefix</Label>
                        <Input id="student_code_prefix" placeholder="Enter prefix" value={formData.student_code_prefix} onChange={(e) => handleInputChange("student_code_prefix", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="student_code_suffix">Student Code Suffix</Label>
                        <Input id="student_code_suffix" placeholder="Enter suffix" value={formData.student_code_suffix} onChange={(e) => handleInputChange("student_code_suffix", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="student_code_digit">Student Code Digit</Label>
                        <Input id="student_code_digit" placeholder="Enter digit count" type="number" value={formData.student_code_digit} onChange={(e) => handleInputChange("student_code_digit", e.target.value)} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="status">
                    <div className="grid grid-cols-1 gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
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
