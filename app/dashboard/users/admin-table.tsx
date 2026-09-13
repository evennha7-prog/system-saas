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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconPlus, IconPencil, IconTrash, IconAlertTriangle, IconRefresh, IconCheck, IconX, IconArrowsSort, IconArrowUp, IconArrowDown } from "@tabler/icons-react"

import { SchoolAdminUser, adminColumns } from "./admin-columns"
import {
  AUTH_TOKEN_KEY,
  getUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserApi,
  approveUser,
  rejectUser,
  type ApiUser,
} from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

function toUiUser(u: ApiUser): SchoolAdminUser {
  return {
    id: String(u.id),
    email: u.email,
    username: u.username || "",
    phonenumber: u.phonenumber || "",
    user_type: u.user_type,
    status: u.status,
    createdAt: u.created_at ? u.created_at.split("T")[0] : "",
    school_name: u.school_name,
  }
}

interface AdminFormData {
  email: string
  password: string
  username: string
  phonenumber: string
  user_type: "SUPER_ADMIN" | "SCHOOL_ADMIN"
  status: "ACTIVE" | "INACTIVE"
}

const emptyFormData: AdminFormData = {
  email: "",
  password: "",
  username: "",
  phonenumber: "",
  user_type: "SCHOOL_ADMIN",
  status: "ACTIVE",
}

export function AdminTable({ searchQuery = "", readOnly = false }: { searchQuery?: string; readOnly?: boolean }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [allData, setAllData] = React.useState<SchoolAdminUser[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editUserId, setEditUserId] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<AdminFormData>(emptyFormData)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  const getToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) throw new Error("Not authenticated")
    return token
  }

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = getToken()
      const response = await getUsers(token)
      if (!response?.data) throw new Error("Invalid response from server")
      setAllData(response.data.map(toUiUser))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const tableData = React.useMemo(() => {
    if (!searchQuery) return allData
    const searchLower = searchQuery.toLowerCase()
    return allData.filter((user) =>
      [user.email, user.username, user.phonenumber, user.user_type].some((val) =>
        String(val ?? "").toLowerCase().includes(searchLower)
      )
    )
  }, [allData, searchQuery])

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdd = () => {
    setIsEditing(false)
    setEditUserId(null)
    setFormError(null)
    setFormData(emptyFormData)
    setOpen(true)
  }

  const handleEdit = (user: SchoolAdminUser) => {
    setIsEditing(true)
    setEditUserId(user.id)
    setFormError(null)
    setFormData({
      email: user.email,
      password: "",
      username: user.username,
      phonenumber: user.phonenumber,
      user_type: user.user_type as "SUPER_ADMIN" | "SCHOOL_ADMIN",
      status: user.status as "ACTIVE" | "INACTIVE",
    })
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      const token = getToken()
      await deleteUserApi(token, Number(deleteId))
      toast.success("User deleted successfully")
      setAllData((prev) => prev.filter((item) => item.id !== deleteId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user")
    } finally {
      setDeleteId(null)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      setFormError(null)
      const token = getToken()

      if (isEditing && editUserId) {
        const payload: Record<string, string> = {}
        if (formData.email) payload.email = formData.email
        if (formData.username) payload.username = formData.username
        if (formData.phonenumber) payload.phonenumber = formData.phonenumber
        if (formData.password) payload.password = formData.password
        payload.user_type = formData.user_type
        payload.status = formData.status
        await updateUserByAdmin(token, Number(editUserId), payload)
        toast.success("User updated successfully")
      } else {
        await createUserByAdmin(token, {
          email: formData.email,
          password: formData.password,
          username: formData.username || undefined,
          user_type: formData.user_type,
        })
        toast.success("User created successfully")
      }

      setOpen(false)
      setFormData(emptyFormData)
      await fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save user"
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId)
      const token = getToken()
      await approveUser(token, Number(userId))
      toast.success("User approved successfully")
      await fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve user")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      setActionLoading(userId)
      const token = getToken()
      await rejectUser(token, Number(userId))
      toast.success("User rejected")
      await fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject user")
    } finally {
      setActionLoading(null)
    }
  }

  const actionColumn: ColumnDef<SchoolAdminUser> = {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      const isPending = user.status === "PENDING"
      const isLoading = actionLoading === user.id
      return (
        <div className="flex items-center gap-1">
          {isPending && (
            <>
              <Button variant="ghost" size="icon" onClick={() => handleApprove(user.id)} disabled={isLoading} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                <IconCheck className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleReject(user.id)} disabled={isLoading} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <IconX className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} disabled={isLoading}>
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} disabled={isLoading}>
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )
    },
    header: "Actions",
  }

  const allColumns = readOnly ? adminColumns : [...adminColumns, actionColumn]

  const table = useReactTable({
    data: tableData,
    columns: allColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: { sorting },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} user(s)
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
            <IconRefresh className="mr-1 h-4 w-4" />
            Refresh
          </Button>
          {!readOnly && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email {!isEditing ? "*" : ""}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">{isEditing ? "New Password (leave blank to keep)" : "Password *"}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={isEditing ? "Leave blank to keep current" : "Min 6 characters"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Optional"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phonenumber">Phone</Label>
                    <Input
                      id="phonenumber"
                      placeholder="Optional"
                      value={formData.phonenumber}
                      onChange={(e) => handleInputChange("phonenumber", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user_type">Role</Label>
                    <Select
                      value={formData.user_type}
                      onValueChange={(value) => handleInputChange("user_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isEditing && (
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {formError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? "Saving..." : isEditing ? "Update User" : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="rounded-md border overflow-x-auto min-h-[200px]">
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
                  No users found.
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user.
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
