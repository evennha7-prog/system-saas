"use client"

import * as React from "react"
import {
  ColumnDef,
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

import { SuperAdmin, columns } from "./columns"

interface SuperAdminFormData {
  id: string
  user_id: string
  email: string
  enname: string
  khname: string
  zhname: string
  phone: string
  role: string
  status: string
}

const emptyFormData: SuperAdminFormData = {
  id: "",
  user_id: "",
  email: "",
  enname: "",
  khname: "",
  zhname: "",
  phone: "",
  role: "",
  status: "active",
}

interface SuperAdminTableProps {
  data?: SuperAdmin[]
}

export function SuperAdminTable({ data = [] }: SuperAdminTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [tableData, setTableData] = React.useState<SuperAdmin[]>(data)
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [formData, setFormData] = React.useState<SuperAdminFormData>(emptyFormData)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("informations")

  React.useEffect(() => {
    if (open) {
      setActiveTab("informations")
    }
  }, [open])

  React.useEffect(() => {
    setTableData(data)
  }, [data])

  const handleInputChange = (field: keyof SuperAdminFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdd = () => {
    setIsEditing(false)
    setFormData(emptyFormData)
    setOpen(true)
  }

  const handleEdit = (admin: SuperAdmin) => {
    setIsEditing(true)
    setFormData({
      id: admin.id,
      user_id: admin.user_id,
      email: admin.email,
      enname: admin.enname,
      khname: admin.khname,
      zhname: admin.zhname,
      phone: admin.phone,
      role: admin.role,
      status: admin.status,
    })
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      setTableData(tableData.filter((item) => item.id !== deleteId))
      setDeleteId(null)
    }
  }

  const handleSubmit = () => {
    const newAdmin: SuperAdmin = {
      id: isEditing ? formData.id : String(Date.now()),
      user_id: formData.user_id,
      email: formData.email,
      enname: formData.enname,
      khname: formData.khname,
      zhname: formData.zhname,
      phone: formData.phone,
      role: formData.role as "super_admin" | "admin" | "teacher" | "student",
      status: formData.status as "active" | "inactive",
      createdAt: isEditing 
        ? tableData.find(t => t.id === formData.id)?.createdAt || new Date().toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    }

    if (isEditing) {
      setTableData(prev => prev.map((item) => (item.id === newAdmin.id ? newAdmin : item)))
    } else {
      setTableData(prev => [...prev, newAdmin])
    }

    setOpen(false)
    setFormData(emptyFormData)
  }

  const actionColumn: ColumnDef<SuperAdmin> = {
    id: "actions",
    cell: ({ row }) => {
      const admin = row.original
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(admin)}>
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(admin.id)}>
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )
    },
    header: "Actions",
  }

  const allColumns = [...columns, actionColumn]

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
          {table.getFilteredRowModel().rows.length} user(s)
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <IconPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogDescription>
                  Enter the user details below.
                </DialogDescription>
              </DialogHeader>

<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-h-[320px]">
                 <TabsList className="grid w-full grid-cols-3">
                   <TabsTrigger value="informations">Informations</TabsTrigger>
                   <TabsTrigger value="contact">Contact</TabsTrigger>
                   <TabsTrigger value="role_status">Role & Status</TabsTrigger>
                 </TabsList>

                <TabsContent value="informations">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="user_id">User ID</Label>
                      <Input
                        id="user_id"
                        placeholder="Enter user ID"
                        value={formData.user_id}
                        onChange={(e) => handleInputChange("user_id", e.target.value)}
                      />
                    </div>
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
                  </div>
                </TabsContent>

                <TabsContent value="contact">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="role_status">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleInputChange("role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {isEditing ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
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