import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    branchMap?: Record<string, string>
    teacherMap?: Record<string, string>
    studentMap?: Record<string, string>
    levelMap?: Record<string, string>
  }
}
