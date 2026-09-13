import { ColumnDef, TableMeta } from "@tanstack/react-table"
import { getImageUrl } from "@/lib/api"

export type Student = {
  id: string
  user_id: string
  tenant_id: string
  school_id: string
  photo: string
  studentcode: string
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
  joinschool: string
  leftschool: string
  father_name?: string
  father_phone?: string
  mother_name?: string
  mother_phone?: string
  branchId: string
  levelId: string
  status: "active" | "inactive"
  createdAt: string
}

export type StudentTableMeta = TableMeta<Student> & {
  nationalityMap?: Record<string, string>
  branchMap?: Record<string, string>
  levelMap?: Record<string, string>
}

function handleDownload(src: string) {
  const a = document.createElement("a")
  a.href = src
  a.download = ""
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export const columns: ColumnDef<Student, any>[] = [
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
            <img src={getImageUrl(photo) || "/resources/avatar/non_pic.jpg"} alt="Student Avatar" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onDoubleClick={() => handleDownload(getImageUrl(photo) || "/resources/avatar/non_pic.jpg")} />
          </div>
        </div>
      )
    },
    size: 80,
  },
  {
    accessorKey: "studentcode",
    header: "Student Code",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("studentcode")}</div>,
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
  },
  {
    accessorKey: "date_of_birth",
    header: "Date of Birth",
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
    cell: ({ row, table }) => {
      const val = row.getValue("nationality") as string;
      const meta = table.options.meta as StudentTableMeta | undefined;
      const map = meta?.nationalityMap;
      return <div>{map?.[val.toLowerCase()] ?? val}</div>;
    },
  },
  {
    accessorKey: "branchId",
    header: "Branch",
    cell: ({ row, table }) => {
      const meta = table.options.meta as StudentTableMeta | undefined;
      return <div>{meta?.branchMap?.[row.getValue("branchId") as string] ?? "Unknown"}</div>;
    },
  },
  {
    accessorKey: "levelId",
    header: "Level",
    cell: ({ row, table }) => {
      const meta = table.options.meta as StudentTableMeta | undefined;
      return <div>{meta?.levelMap?.[row.getValue("levelId") as string] ?? "Unknown"}</div>;
    },
  },
  {
    accessorKey: "joinschool",
    header: "Join School",
    cell: ({ row }) => row.getValue("joinschool") || "—",
  },
  {
    accessorKey: "leftschool",
    header: "Left School",
    cell: ({ row }) => row.getValue("leftschool") || "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {status}
        </span>
      )
    },
  },
]
