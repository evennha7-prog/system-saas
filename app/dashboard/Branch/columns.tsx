import { ColumnDef } from "@tanstack/react-table"

export type Branch = {
  id: string
  tenant_id?: string
  khname?: string
  enname?: string
  zhname?: string
  school_id?: string
  student_code_prefix: string
  student_code_suffix: string
  student_code_digit: string
  status: "active" | "inactive"
  createdAt: string
}

export const columns: ColumnDef<Branch>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "tenant_id",
    header: "Tenant ID",
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("tenant_id")}</div>,
  },
  {
    accessorKey: "khname",
    header: "Khmer Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("khname")}</div>,
  },
  {
    accessorKey: "enname",
    header: "English Name",
    cell: ({ row }) => <div className="w-[150px]">{row.getValue("enname")}</div>,
  },
  {
    accessorKey: "zhname",
    header: "Chinese Name",
    cell: ({ row }) => <div className="w-[150px]">{row.getValue("zhname")}</div>,
  },
  {
    accessorKey: "student_code_prefix",
    header: "Code Prefix",
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("student_code_prefix")}</div>,
  },
  {
    accessorKey: "student_code_suffix",
    header: "Code Suffix",
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("student_code_suffix")}</div>,
  },
  {
    accessorKey: "student_code_digit",
    header: "Code Digit",
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("student_code_digit")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="w-[100px]">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {status}
          </span>
        </div>
      )
    },
  },
]
