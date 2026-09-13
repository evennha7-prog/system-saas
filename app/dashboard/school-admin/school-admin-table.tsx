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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconPencil, IconTrash, IconAlertTriangle } from "@tabler/icons-react"

import { SchoolAdmin, columns } from "./school-admin-columns"
import { AUTH_TOKEN_KEY, getUsers, type ApiUser } from "@/lib/api"
import { toast } from "sonner"

function toSchoolAdmin(u: ApiUser): SchoolAdmin {
  return {
    id: String(u.id),
    user_id: String(u.id),
    email: u.email,
    enname: u.username ?? "",
    khname: u.username ?? "",
    zhname: "",
    phone: u.phonenumber ?? "",
    school_id: u.school_name ?? "",
    role: u.user_type === "SCHOOL_ADMIN" ? "school_admin" : u.user_type === "SUPER_ADMIN" ? "teacher" : "student",
    status: u.status === "ACTIVE" ? "active" : "inactive",
    createdAt: u.created_at?.split("T")[0] ?? "",
  }
}

export function SchoolAdminTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [tableData, setTableData] = React.useState<SchoolAdmin[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) throw new Error("Not authenticated")
      const res = await getUsers(token)
      if (res?.data) {
        const admins = res.data
          .filter(u => u.user_type === "SCHOOL_ADMIN")
          .map(toSchoolAdmin)
        setTableData(admins)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load school admins")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { loadData() }, [loadData])

  const confirmDelete = () => {
    setDeleteId(null)
  }

  const actionColumn: ColumnDef<SchoolAdmin> = {
    id: "actions",
    cell: ({ row }) => {
      const admin = row.original
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(admin.id)}>
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
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
