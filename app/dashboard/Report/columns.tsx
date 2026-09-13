import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Report = {
  id: string
  title: string
  type: "academic" | "behavior" | "progress"
  branchId: string
  teacherId: string
  studentId: string
  score: number
  date: string
  schoolId: string
  status: "draft" | "published" | "archived"
  description?: string
  notes?: string
}

export const columns: ColumnDef<Report>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: "Report Title",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return <div className="w-[120px] capitalize">{type}</div>
    },
  },
  {
    accessorKey: "branchId",
    header: "Branch",
    cell: ({ row, table }) => <div className="w-[120px]">{table.options.meta?.branchMap?.[String(row.getValue("branchId"))] ?? "Unknown"}</div>,
  },
  {
    accessorKey: "teacherId",
    header: "Teacher",
    cell: ({ row, table }) => <div className="w-[150px]">{table.options.meta?.teacherMap?.[String(row.getValue("teacherId"))] ?? "Unknown"}</div>,
  },
  {
    accessorKey: "studentId",
    header: "Student",
    cell: ({ row, table }) => <div className="w-[150px]">{table.options.meta?.studentMap?.[String(row.getValue("studentId"))] ?? "Unknown"}</div>,
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("score")}</div>,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === "published" ? "default" : status === "draft" ? "secondary" : "outline"
      return (
        <div className="w-[100px]">
          <Badge variant={variant}>{status}</Badge>
        </div>
      )
    },
  },
]
