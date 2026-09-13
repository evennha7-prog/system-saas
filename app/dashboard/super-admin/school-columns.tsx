import { ColumnDef } from "@tanstack/react-table"

export type School = {
  id: string
  tenant_id?: string
  user_id?: string
  khname?: string
  enname?: string
  zhname?: string
  student_code_prefix?: string
  student_code_suffix?: string
  student_code_digit?: string
  short_school?: string
  adminEmail?: string
  adminName?: string
  adminPhone?: string
  createdAt: string
}

export const columns: ColumnDef<School>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "enname",
    header: "School Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("enname") || "-"}</div>,
  },
  {
    id: "adminInfo",
    header: "Admin Info",
    cell: ({ row }) => {
      const email = row.original.adminEmail || "-"
      const name = row.original.adminName || "-"
      const phone = row.original.adminPhone || "-"
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{name}</span>
          <span className="text-xs text-muted-foreground">{email}</span>
          {phone !== "-" && <span className="text-xs text-muted-foreground">{phone}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "khname",
    header: "Khmer Name",
    cell: ({ row }) => <div>{row.getValue("khname") || "-"}</div>,
  },
  {
    accessorKey: "zhname",
    header: "Chinese Name",
    cell: ({ row }) => <div>{row.getValue("zhname") || "-"}</div>,
  },
  {
    accessorKey: "short_school",
    header: "Short Name",
    cell: ({ row }) => <div className="text-sm">{row.getValue("short_school") || "-"}</div>,
  },
  {
    accessorKey: "student_code_prefix",
    header: "Code Prefix",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("student_code_prefix") || "-"}</div>,
  },
  {
    accessorKey: "student_code_suffix",
    header: "Code Suffix",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("student_code_suffix") || "-"}</div>,
  },
  {
    accessorKey: "student_code_digit",
    header: "Code Digits",
    cell: ({ row }) => <div className="text-sm">{row.getValue("student_code_digit") || "-"}</div>,
  },
  {
    accessorKey: "tenant_id",
    header: "Tenant ID",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("tenant_id") || "-"}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => <div className="text-sm">{row.getValue("createdAt") || "-"}</div>,
  },
]
