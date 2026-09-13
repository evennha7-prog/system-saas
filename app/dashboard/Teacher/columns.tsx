import { ColumnDef } from "@tanstack/react-table"
import { getImageUrl } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function handleDownload(src: string) {
  const a = document.createElement("a")
  a.href = src
  a.download = ""
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export type Teacher = {
  id: string
  user_id: string
  tenant_id: string
  school_id: string
  photo: string
  teachercode: string
  enname: string
  khname: string
  zhname: string
  gender: string
  date_of_birth: string
  nationality: string
  religion: string
  pob_province: string
  pob_district: string
  pob_commune: string
  pob_village: string
  cur_province: string
  cur_district: string
  cur_commune: string
  cur_village: string
  joinwork: string
  leftwork: string
  father_name?: string
  father_phone?: string
  mother_name?: string
  mother_phone?: string
  branchId: string
  subject: string
  status: "active" | "inactive" | "on_leave"
  createdAt: string
}

export const columns: ColumnDef<Teacher>[] = [
  {
    id: "index",
    header: "No",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination
      return <div className="text-muted-foreground text-sm font-medium text-center w-full">{pageIndex * pageSize + row.index + 1}</div>
    },
    enableSorting: false,
    size: 50,
  },
  {
    accessorKey: "photo",
    header: "Photo",
    cell: ({ row }) => {
      const photo = row.getValue("photo") as string
      return (
        <div className="flex items-center justify-center w-full py-0.5">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-muted shadow-sm flex items-center justify-center shrink-0">
            <img src={getImageUrl(photo) || "/resources/avatar/non-pic1.png"} alt="Teacher Avatar" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onDoubleClick={() => handleDownload(getImageUrl(photo) || "/resources/avatar/non-pic1.png")} />
          </div>
        </div>
      )
    },
    size: 80,
  },
  {
    accessorKey: "teachercode",
    header: "Teacher Code",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("teachercode")}</div>,
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
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("gender")}</div>,
  },
  {
    accessorKey: "date_of_birth",
    header: "Date of Birth",
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("date_of_birth")}</div>,
  },
  {
    id: "place_of_birth",
    header: "Place of Birth",
    accessorFn: (row) => [row.pob_village, row.pob_commune, row.pob_district, row.pob_province].filter(Boolean).join(", "),
    cell: ({ row }) => {
      const { pob_province, pob_district, pob_commune, pob_village } = row.original;
      return <div className="w-full" title={[pob_village, pob_commune, pob_district, pob_province].filter(Boolean).join(", ")}>{[pob_village, pob_commune, pob_district, pob_province].filter(Boolean).join(", ")}</div>
    },
  },
  {
    id: "current_address",
    header: "Current Address",
    accessorFn: (row) => [row.cur_village, row.cur_commune, row.cur_district, row.cur_province].filter(Boolean).join(", "),
    cell: ({ row }) => {
      const { cur_province, cur_district, cur_commune, cur_village } = row.original;
      return <div className="w-full" title={[cur_village, cur_commune, cur_district, cur_province].filter(Boolean).join(", ")}>{[cur_village, cur_commune, cur_district, cur_province].filter(Boolean).join(", ")}</div>
    },
  },
  {
    accessorKey: "father_name",
    header: "Father Name",
    cell: ({ row }) => row.getValue("father_name") || "—",
  },
  {
    accessorKey: "father_phone",
    header: "Father Phone",
    cell: ({ row }) => row.getValue("father_phone") || "—",
  },
  {
    accessorKey: "mother_name",
    header: "Mother Name",
    cell: ({ row }) => row.getValue("mother_name") || "—",
  },
  {
    accessorKey: "mother_phone",
    header: "Mother Phone",
    cell: ({ row }) => row.getValue("mother_phone") || "—",
  },
  {
    accessorKey: "nationality",
    header: "Nationality",
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("subject")}</div>,
  },
  {
    accessorKey: "branchId",
    header: "Branch",
    cell: ({ row }) => <div className="w-[120px]">{row.getValue("branchId")}</div>,
  },
  {
    accessorKey: "joinwork",
    header: "Join Work",
    cell: ({ row }) => row.getValue("joinwork") || "—",
  },
  {
    accessorKey: "leftwork",
    header: "Left Work",
    cell: ({ row }) => row.getValue("leftwork") || "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === "active" ? "default" : status === "on_leave" ? "secondary" : "outline"
      return (
        <div className="w-[100px]">
          <Badge variant={variant}>{status.replace("_", " ")}</Badge>
        </div>
      )
    },
  },
]
