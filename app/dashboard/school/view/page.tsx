"use client"

import { ProtectedRoute } from "@/lib/protected-route"
import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AUTH_TOKEN_KEY, getSchools, register, approveUser, type ApiSchool } from "@/lib/api"
import { IconSearch, IconEye, IconSchool, IconPlus, IconArrowUp, IconArrowDown, IconArrowsSort, IconDownload, IconFileSpreadsheet } from "@tabler/icons-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import * as XLSX from "xlsx"

export default function ViewSchoolPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [schools, setSchools] = React.useState<ApiSchool[]>([])
  const [filtered, setFiltered] = React.useState<ApiSchool[]>([])
  const [search, setSearch] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
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
    tenant_id: "",
    student_code_prefix: "",
    student_code_suffix: "",
    student_code_digit: "",
    school_enname: "",
    school_khname: "",
    school_zhname: "",
    school_short: "",
  })
  const [step, setStep] = React.useState(1)

  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false)
  const [availableColumns, setAvailableColumns] = React.useState([
    { id: "tenant_id", label: "Tenant ID", checked: true },
    { id: "admin_username", label: "Admin Username", checked: true },
    { id: "admin_email", label: "Admin Email", checked: true },
    { id: "enname", label: "English Name", checked: true },
    { id: "khname", label: "Khmer Name", checked: true },
    { id: "zhname", label: "Chinese Name", checked: true },
    { id: "short", label: "Short", checked: true },
    { id: "prefix", label: "Prefix", checked: true },
    { id: "suffix", label: "Suffix", checked: true },
    { id: "digit", label: "Digit", checked: true },
  ])

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddUser = async () => {
    if (!formData.username) {
      setFormError("Username is required")
      return
    }
    if (!formData.email || !formData.password) {
      setFormError("Email and password are required")
      return
    }
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)
      const res = await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        phonenumber: formData.phonenumber || undefined,
        user_type: "SCHOOL_ADMIN",
        student_code_prefix: formData.student_code_prefix || undefined,
        student_code_suffix: formData.student_code_suffix || undefined,
        student_code_digit: formData.student_code_digit || undefined,
        school_enname: formData.school_enname || undefined,
        school_khname: formData.school_khname || undefined,
        school_zhname: formData.school_zhname || undefined,
        school_short: formData.school_short || undefined,
      })

      // Automatically approve if the creator is SUPER_ADMIN
      if (user?.user_type === "SUPER_ADMIN" && res.id) {
        const token = localStorage.getItem(AUTH_TOKEN_KEY)
        if (token) {
          try {
            await approveUser(token, res.id)
          } catch (e) {
            console.error("Failed to automatically approve user", e)
            toast.error("User created but failed to automatically approve.")
          }
        }
      }

      toast.success("School Admin created and approved successfully")
      setIsDialogOpen(false)
      setStep(1)
      setFormData({
        email: "",
        password: "",
        username: "",
        phonenumber: "",
        tenant_id: "",
        student_code_prefix: "",
        student_code_suffix: "",
        student_code_digit: "",
        school_enname: "",
        school_khname: "",
        school_zhname: "",
        school_short: "",
      })
      // reload schools list
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY)
        if (token) {
          const res = await getSchools(token)
          setSchools(res.data ?? [])
          setFiltered(res.data ?? [])
        }
      } catch (e) {
        console.error("Failed to reload schools", e)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user"
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  React.useEffect(() => {
    const fetchSchools = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem(AUTH_TOKEN_KEY)
        if (!token) throw new Error("Not authenticated")
        const res = await getSchools(token)
        
        if (user?.user_type === "SCHOOL_ADMIN" && res.data && res.data.length > 0) {
          router.replace(`/dashboard/school/view/${res.data[0].id}`)
          return
        }

        setSchools(res.data ?? [])
        setFiltered(res.data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load schools")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSchools()
  }, [user, router])

  React.useEffect(() => {
    const q = search.toLowerCase()
    let result = schools
    if (q) {
      result = result.filter(
        (s) =>
          s.enname?.toLowerCase().includes(q) ||
          s.khname?.toLowerCase().includes(q) ||
          s.zhname?.toLowerCase().includes(q) ||
          s.short_school?.toLowerCase().includes(q) ||
          s.tenant_id?.toLowerCase().includes(q)
      )
    }

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof ApiSchool]
        let bValue: any = b[sortConfig.key as keyof ApiSchool]

        if (sortConfig.key === 'admin_username') {
          aValue = a.user?.username
          bValue = b.user?.username
        } else if (sortConfig.key === 'admin_email') {
          aValue = a.user?.email
          bValue = b.user?.email
        }

        if (aValue == null) aValue = ""
        if (bValue == null) bValue = ""

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setFiltered(result)
  }, [search, schools, sortConfig])

  const renderSortableHeader = (label: string, key: string) => (
    <TableHead className="cursor-pointer select-none hover:bg-muted/80 transition-colors" onClick={() => handleSort(key)}>
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        {label}
        {sortConfig?.key === key ? (
          sortConfig.direction === "asc" ? (
            <IconArrowUp className="h-3.5 w-3.5 text-foreground" />
          ) : (
            <IconArrowDown className="h-3.5 w-3.5 text-foreground" />
          )
        ) : (
          <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground/50" />
        )}
      </div>
    </TableHead>
  )

  const toggleColumn = (id: string) => {
    setAvailableColumns(cols => cols.map(c => c.id === id ? { ...c, checked: !c.checked } : c))
  }

  const handleSelectAllToggle = () => {
    const allChecked = availableColumns.every(c => c.checked)
    setAvailableColumns(cols => cols.map(c => ({ ...c, checked: !allChecked })))
  }

  const executeExportExcel = () => {
    if (!filtered || filtered.length === 0) {
      toast.error("No schools available to export")
      return
    }

    const selectedCols = availableColumns.filter(c => c.checked)
    if (selectedCols.length === 0) {
      toast.error("Please select at least one column")
      return
    }

    try {
      const dataToExport = filtered.map((school, index) => {
        const row: any = { "No": index + 1 }
        
        selectedCols.forEach(col => {
          switch(col.id) {
            case "tenant_id": row[col.label] = school.tenant_id || "—"; break;
            case "admin_username": row[col.label] = school.user?.username || "—"; break;
            case "admin_email": row[col.label] = school.user?.email || "—"; break;
            case "enname": row[col.label] = school.enname || "—"; break;
            case "khname": row[col.label] = school.khname || "—"; break;
            case "zhname": row[col.label] = school.zhname || "—"; break;
            case "short": row[col.label] = school.short_school || "—"; break;
            case "prefix": row[col.label] = school.student_code_prefix || "—"; break;
            case "suffix": row[col.label] = school.student_code_suffix || "—"; break;
            case "digit": row[col.label] = school.student_code_digit != null ? school.student_code_digit : "—"; break;
          }
        })
        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Schools")
      XLSX.writeFile(workbook, `All_Schools.xlsx`)
      toast.success("Schools exported successfully")
      setIsExportModalOpen(false)
    } catch (err) {
      toast.error("Failed to export to Excel")
      console.error(err)
    }
  }

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-3 lg:px-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconSchool className="h-6 w-6 text-primary" />
                  All Schools
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Click on a school to view its users and details.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsExportModalOpen(true)}
                  className="gap-1.5"
                >
                  <IconDownload className="h-4 w-4" />
                  Export Excel
                </Button>
                {user?.user_type === "SUPER_ADMIN" && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="gap-1.5 rounded-full px-4"
                      >
                        <IconPlus className="h-4 w-4" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add School Admin</DialogTitle>
                      </DialogHeader>
                      <div className="flex items-center justify-center py-4">
                        <div className={`flex font-bold items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          1
                        </div>
                        <div className={`h-[2px] w-12 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`flex font-bold items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-[#31312d] text-muted-foreground'}`}>
                          2
                        </div>
                      </div>
                      
                      {step === 1 && (
                        <div className="grid gap-4 py-2">
                          <div className="grid gap-2">
                            <Label htmlFor="school_enname">English Name</Label>
                            <Input
                              id="school_enname"
                              placeholder="School English Name"
                              value={formData.school_enname}
                              onChange={(e) => handleInputChange("school_enname", e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="school_khname">Khmer Name</Label>
                            <Input
                              id="school_khname"
                              placeholder="School Khmer Name"
                              value={formData.school_khname}
                              onChange={(e) => handleInputChange("school_khname", e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="school_zhname">Chinese Name</Label>
                            <Input
                              id="school_zhname"
                              placeholder="School Chinese Name"
                              value={formData.school_zhname}
                              onChange={(e) => handleInputChange("school_zhname", e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="school_short">Short Name</Label>
                            <Input
                              id="school_short"
                              placeholder="e.g. NK ONE"
                              value={formData.school_short}
                              onChange={(e) => handleInputChange("school_short", e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="grid gap-2">
                              <Label htmlFor="student_code_prefix">Prefix</Label>
                              <Input
                                id="student_code_prefix"
                                placeholder="STU-"
                                value={formData.student_code_prefix}
                                onChange={(e) => handleInputChange("student_code_prefix", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="student_code_suffix">Suffix</Label>
                              <Input
                                id="student_code_suffix"
                                placeholder="-CS"
                                value={formData.student_code_suffix}
                                onChange={(e) => handleInputChange("student_code_suffix", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="student_code_digit">Digit</Label>
                              <Input
                                id="student_code_digit"
                                type="number"
                                placeholder="4"
                                value={formData.student_code_digit}
                                onChange={(e) => handleInputChange("student_code_digit", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="grid gap-4 py-2">
                          <div className="grid gap-2">
                            <Label htmlFor="username">Username School-Admin *</Label>
                            <Input
                              id="username"
                              placeholder="e.g. admin.school"
                              value={formData.username}
                              onChange={(e) => handleInputChange("username", e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="admin@school.com"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="Min 6 characters"
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="phonenumber">Phone Number</Label>
                            <Input
                              id="phonenumber"
                              type="tel"
                              placeholder="+855 12 345 678"
                              value={formData.phonenumber}
                              onChange={(e) => handleInputChange("phonenumber", e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {formError && (
                        <Alert variant="destructive">
                          <AlertDescription>{formError}</AlertDescription>
                        </Alert>
                      )}
                      <DialogFooter>
                        {step === 1 ? (
                          <>
                            <Button variant="outline" onClick={() => {
                              setIsDialogOpen(false)
                              setFormError(null)
                              setStep(1)
                              setFormData({
                                   username: "",
                                email: "",
                                password: "",
                             
                                phonenumber: "",
                                tenant_id: "",
                                student_code_prefix: "",
                                student_code_suffix: "",
                                student_code_digit: "",
                                school_enname: "",
                                school_khname: "",
                                school_zhname: "",
                                school_short: "",
                              })
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={() => setStep(2)}>
                              Next
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" onClick={() => setStep(1)}>
                              Back
                            </Button>
                            <Button onClick={handleAddUser} disabled={isSaving}>
                              {isSaving ? "Creating..." : "Create User"}
                            </Button>
                          </>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4 max-w-sm">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mb-4">
                {error}
              </div>
            )}

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">No</TableHead>
                    {renderSortableHeader("Tenant ID", "tenant_id")}
                    {renderSortableHeader("Admin Username", "admin_username")}
                    {renderSortableHeader("Admin Email", "admin_email")}
                    {renderSortableHeader("English Name", "enname")}
                    {renderSortableHeader("Khmer Name", "khname")}
                    {renderSortableHeader("Chinese Name", "zhname")}
                    {renderSortableHeader("Short", "short_school")}
                    {renderSortableHeader("Prefix", "student_code_prefix")}
                    {renderSortableHeader("Suffix", "student_code_suffix")}
                    {renderSortableHeader("Digit", "student_code_digit")}
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 12 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                        {search ? "No schools match your search." : "No schools found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((school, idx) => (
                      <TableRow
                        key={school.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => router.push(`/dashboard/school/view/${school.id}`)}
                      >
                        <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {school.tenant_id || "—"}
                        </TableCell>
                        <TableCell>
                          {school.user?.username || <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell>
                          {school.user?.email || <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell className="font-medium">
                          {school.enname || <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell>
                          {school.khname || <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell>
                          {school.zhname || <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell>
                          {school.short_school ? (
                            <Badge variant="outline">{school.short_school}</Badge>
                          ) : (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {school.student_code_prefix || <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {school.student_code_suffix || <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {school.student_code_digit != null ? school.student_code_digit : <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/school/view/${school.id}`)
                            }}
                            className="gap-1.5"
                          >
                            <IconEye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

          </div>
        </div>
      </div>

      <Dialog open={isExportModalOpen} onOpenChange={(open) => !open && setIsExportModalOpen(false)}>
        <DialogContent className="max-w-md bg-zinc-950 text-zinc-50 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <IconFileSpreadsheet className="h-5 w-5 text-emerald-500" />
              <span>Export to Excel</span>
            </DialogTitle>
            <p className="text-sm text-zinc-400 mt-1">
              Select the columns you want to include in the export.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 max-h-[50vh] overflow-y-auto">
            {availableColumns.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2.5 cursor-pointer text-sm font-medium hover:text-white select-none p-2 rounded-lg transition-colors hover:bg-zinc-900"
              >
                <input
                  type="checkbox"
                  checked={col.checked}
                  onChange={() => toggleColumn(col.id)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                />
                <span>{col.label}</span>
              </label>
            ))}
          </div>

          <DialogFooter className="flex items-center justify-between border-t border-zinc-800 pt-4 w-full gap-2 sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold px-2 hover:bg-zinc-900 text-zinc-300 hover:text-white"
              onClick={handleSelectAllToggle}
            >
              {availableColumns.every(c => c.checked) ? "Deselect All" : "Select All"}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(false)} className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white">
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                onClick={executeExportExcel}
              >
                <IconFileSpreadsheet className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}