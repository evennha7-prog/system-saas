import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Level = {
  id: string
  school_id: string
  name: string
  description?: string
  display_order: number
  status: "active" | "inactive"
  createdAt: string
}

export const columns: ColumnDef<Level>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => <div className="text-muted-foreground text-sm w-8">{row.index + 1}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Level Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "school_id",
    header: "School ID",
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("school_id")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="w-[200px]">{row.getValue("description") || "-"}</div>,
  },
  {
    accessorKey: "display_order",
    header: "Order",
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("display_order")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="w-[100px]">
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
      )
    },
  },
]
