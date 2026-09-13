"use client"

import * as React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { IconPlus, IconPencil, IconAlertTriangle, IconEye, IconArrowsSort, IconArrowUp, IconArrowDown } from "@tabler/icons-react"

import { School, columns } from "./school-columns"
import {
  AUTH_TOKEN_KEY,
  getSchools,
  createSchool,
  updateSchool,
  updateSchoolProfile,
  type ApiSchool,
  type SchoolPayload,
} from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

function convertApiSchoolToTableSchool(apiSchool: ApiSchool): School {
  return {
    id: String(apiSchool.id),
    tenant_id: apiSchool.tenant_id,
    user_id: String(apiSchool.user_id ?? ""),
    khname: apiSchool.khname,
    enname: apiSchool.enname,
    zhname: apiSchool.zhname,
    student_code_prefix: apiSchool.student_code_prefix,
    student_code_suffix: apiSchool.student_code_suffix,
    student_code_digit: String(apiSchool.student_code_digit ?? ""),
    short_school: apiSchool.short_school,
    adminEmail: apiSchool.user?.email || "-",
    adminName: apiSchool.user?.username || "-",
    adminPhone: apiSchool.user?.phonenumber || "-",
    createdAt: apiSchool.created_at ? new Date(apiSchool.created_at).toISOString().split("T")[0] : "",
  }
}

interface SchoolFormData {
  khname: string
  enname: string
  zhname: string
  student_code_prefix: string
  student_code_suffix: string
  student_code_digit: string
  short_school: string
}

const emptyFormData: SchoolFormData = {
  khname: "",
  enname: "",
  zhname: "",
  student_code_prefix: "",
  student_code_suffix: "",
  student_code_digit: "",
  short_school: "",
}

interface SchoolTableProps {
  data?: School[]
  isLoading?: boolean
  error?: string | null
  onCreate?: (payload: SchoolPayload) => Promise<void>
  onUpdate?: (id: number, payload: Partial<SchoolPayload>) => Promise<void>
  onView?: (id: number) => void
}

export function SchoolTable({
  data: externalData,
  isLoading: externalLoading,
  error: externalError,
  onCreate: externalCreate,
  onUpdate: externalUpdate,
  onView: externalView,
}: SchoolTableProps) {
  const { user } = useAuth()
  const isSchoolAdmin = user?.user_type === "SCHOOL_ADMIN"
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [allData, setAllData] = React.useState<School[]>([])
  const [localLoading, setLocalLoading] = React.useState(true)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<SchoolFormData>(emptyFormData)
  const [activeTab, setActiveTab] = React.useState("informations")

  React.useEffect(() => {
    if (open) {
      setActiveTab("informations")
    }
  }, [open])
  const isLoading = externalLoading ?? localLoading
  const error = externalError ?? localError

  const effectiveData = externalData ?? allData
  const canCreateSchool = !isSchoolAdmin || effectiveData.length === 0

  const getToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) throw new Error("Not authenticated")
    return token
  }

  const fetchSchools = React.useCallback(async () => {
    try {
      setLocalLoading(true)
      setLocalError(null)
      const token = getToken()
      const response = await getSchools(token)
      if (!response?.data) throw new Error("Invalid response from server")
      setAllData(response.data.map(convertApiSchoolToTableSchool))
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to fetch schools")
    } finally {
      setLocalLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!externalData) {
      fetchSchools()
    }
  }, [fetchSchools, externalData])

  const handleInputChange = (field: keyof SchoolFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdd = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormError(null)
    setFormData(emptyFormData)
    setOpen(true)
  }

  const handleEdit = (school: School) => {
    setIsEditing(true)
    setEditingId(Number(school.id))
    setFormError(null)
    setFormData({
      enname: school.enname ?? "",
      khname: school.khname ?? "",
      zhname: school.zhname ?? "",
      short_school: school.short_school ?? "",
      student_code_prefix: school.student_code_prefix ?? "",
      student_code_suffix: school.student_code_suffix ?? "",
      student_code_digit: school.student_code_digit ?? "",
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    const payload: SchoolPayload = {
      khname: formData.khname || undefined,
      enname: formData.enname || undefined,
      zhname: formData.zhname || undefined,
      student_code_prefix: formData.student_code_prefix || undefined,
      student_code_suffix: formData.student_code_suffix || undefined,
      student_code_digit: formData.student_code_digit ? Number(formData.student_code_digit) : undefined,
      short_school: formData.short_school || undefined,
    }

    try {
      setIsSaving(true)
      setFormError(null)

      if (isEditing && editingId !== null) {
        if (externalUpdate) {
          await externalUpdate(editingId, payload)
        } else {
          const token = getToken()
          if (isSchoolAdmin) {
            await updateSchoolProfile(token, payload)
          } else {
            await updateSchool(token, editingId, payload)
          }
        }
        toast.success("School updated successfully")
      } else {
        if (externalCreate) {
          await externalCreate(payload)
        } else {
          const token = getToken()
          await createSchool(token, payload)
        }
        toast.success("School created successfully")
      }

      setOpen(false)
      setFormData(emptyFormData)
      if (externalCreate || externalUpdate) {
        // parent will refresh data
      } else {
        await fetchSchools()
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "Failed to save school"
      const message = rawMessage.toLowerCase().includes("already exists")
        ? "You create Information school already"
        : rawMessage
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const actionColumn: ColumnDef<School> = {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex items-center gap-2">
          {externalView ? (
            <Button variant="ghost" size="icon" onClick={() => externalView(Number(item.id))} title="View">
              <IconEye className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
            <IconPencil className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    header: "Actions",
  }

  const allColumns = [...columns, actionColumn]

  const table = useReactTable({
    data: effectiveData,
    columns: allColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} school(s)
        </div>
        <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
        </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit School" : "Add New School"}
            </DialogTitle>
            <DialogDescription>
              Fill in the school details below.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-h-[320px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="informations">Informations</TabsTrigger>
              <TabsTrigger value="codes">Code Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="informations">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="enname">English Name</Label>
                  <Input
                    id="enname"
                    placeholder="Enter English name"
                    value={formData.enname}
                    onChange={(e) => handleInputChange("enname", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="khname">Khmer Name</Label>
                  <Input
                    id="khname"
                    placeholder="Enter Khmer name"
                    value={formData.khname}
                    onChange={(e) => handleInputChange("khname", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zhname">Chinese Name</Label>
                  <Input
                    id="zhname"
                    placeholder="Enter Chinese name"
                    value={formData.zhname}
                    onChange={(e) => handleInputChange("zhname", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="short_school">Short School Name</Label>
                  <Input
                    id="short_school"
                    placeholder="e.g. NK ONE"
                    value={formData.short_school}
                    onChange={(e) => handleInputChange("short_school", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="codes">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="student_code_prefix">Student Code Prefix</Label>
                  <Input
                    id="student_code_prefix"
                    placeholder="e.g. STU-"
                    value={formData.student_code_prefix}
                    onChange={(e) => handleInputChange("student_code_prefix", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student_code_suffix">Student Code Suffix</Label>
                  <Input
                    id="student_code_suffix"
                    placeholder="e.g. -CS"
                    value={formData.student_code_suffix}
                    onChange={(e) => handleInputChange("student_code_suffix", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student_code_digit">Code Digit Length</Label>
                  <Input
                    id="student_code_digit"
                    type="number"
                    min={0}
                    placeholder="e.g. 4"
                    value={formData.student_code_digit}
                    onChange={(e) => handleInputChange("student_code_digit", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {formError ? (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="rounded-md border min-h-[200px] overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.column.getCanSort() ? "cursor-pointer select-none hover:bg-muted/50" : ""} onClick={header.column.getToggleSortingHandler()}>
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <IconArrowUp className="h-3.5 w-3.5 text-foreground" />,
                          desc: <IconArrowDown className="h-3.5 w-3.5 text-foreground" />,
                        }[header.column.getIsSorted() as string] ?? (header.column.getCanSort() ? <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground/50" /> : null)}
                      </div>
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
                    <TableCell key={cell.id}>
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
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
