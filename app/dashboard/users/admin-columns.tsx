import { ColumnDef } from "@tanstack/react-table"

export type SchoolAdminUser = {
  id: string
  email: string
  username: string
  phonenumber: string
  user_type: string
  status: string
  createdAt: string
  school_name?: string
}

export const adminColumns: ColumnDef<SchoolAdminUser>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => <div className="font-medium">{row.getValue("username") || "—"}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phonenumber",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phonenumber") || "—"}</div>,
  },
  {
    accessorKey: "user_type",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("user_type") as string
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {role === "SUPER_ADMIN" ? "Super Admin" : "School Admin"}
        </span>
      )
    },
  },
  {
    id: "schoolOrAccess",
    header: "School / Access",
    cell: ({ row }) => {
      const role = row.getValue("user_type") as string
      const schoolName = row.original.school_name
      if (role === "SUPER_ADMIN") {
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded">Reports</span>
            <span className="text-xs text-muted-foreground">All Schools</span>
          </div>
        )
      }
      return <span className="text-sm">{schoolName || "—"}</span>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const style = status === "ACTIVE" ? "bg-green-100 text-green-800" :
        status === "PENDING" ? "bg-amber-100 text-amber-800" :
        "bg-red-100 text-red-800"
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]
