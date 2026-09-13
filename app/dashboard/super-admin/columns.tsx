import { ColumnDef } from "@tanstack/react-table"

export type SuperAdmin = {
  id: string
  user_id: string
  email: string
  enname: string
  khname: string
  zhname: string
  phone: string
  role: "super_admin" | "admin" | "teacher" | "student"
  status: "active" | "inactive"
  createdAt: string
}

export const columns: ColumnDef<SuperAdmin>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "enname",
    header: "English Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("enname")}</div>,
  },
  {
    accessorKey: "khname",
    header: "Khmer Name",
  },
  {
    accessorKey: "zhname",
    header: "Chinese Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          role === "super_admin" ? "bg-purple-100 text-purple-800" :
          role === "admin" ? "bg-blue-100 text-blue-800" :
          role === "teacher" ? "bg-green-100 text-green-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {role.replace("_", " ").charAt(0).toUpperCase() + role.replace("_", " ").slice(1)}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]
