"use client";

import { ProtectedRoute } from "@/lib/protected-route"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic";

import * as React from "react"
import { SectionCards } from "@/components/section-cards";
import { CollapsibleSection } from "@/components/collapsible-section";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { StudentTable } from "../Student/student-table";
import { TeacherTable } from "../Teacher/teacher-table";
import { BranchTable } from "../Branch/branch-table";
import { LevelTable } from "../Level/level-table";
import { ReportTable } from "../Report/report-table";
import { SchoolTable } from "../super-admin/school-table";
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  IconUser,
  IconUsers,
  IconBuilding,
  IconBook,
  IconReport,
  IconSchool,
  IconBuildingSkyscraper,
  IconClipboardList,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { School } from "../super-admin/school-columns";
import {
  AUTH_TOKEN_KEY,
  type StudentPayload,
  type EmployeePayload,
  type BranchPayload,
  type LevelPayload,
  type SchoolPayload,
  type ReportPayload,
  createStudent,
  createEmployee,
  createBranch,
  createLevel,
  createReport,
  updateStudent,
  updateEmployee,
  updateBranch,
  updateLevel,
  updateReport,
  deleteStudent,
  deleteEmployee,
  deleteBranch,
  deleteLevel,
  deleteReport,
  getStudents,
  getEmployees,
  getBranches,
  getLevels,
  getReports,
  getSchools,
  createSchool,
  updateSchool,
  updateSchoolProfile,
  deleteSchool,
  type ApiReport,
  type ApiStudent,
  type ApiEmployee,
  type ApiBranch,
  type ApiLevel,
  type ApiSchool,
} from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

import type { Student } from "../Student/columns";
import type { Teacher } from "../Teacher/columns";
import type { Branch } from "../Branch/columns";
import type { Level } from "../Level/columns";
import type { Report } from "../Report/columns";

function toUiStudent(s: ApiStudent): Student {
  return {
    id: String(s.id),
    user_id: String(s.user_id ?? ""),
    tenant_id: s.tenant_id ?? "",
    school_id: String(s.school_id ?? ""),
    photo: s.photo ?? "",
    studentcode: s.studentcode ?? "",
    enname: s.enname ?? "",
    khname: s.khname ?? "",
    zhname: s.zhname ?? "",
    gender: s.gender ?? "",
    date_of_birth: s.date_of_birth ?? "",
    nationality: s.nationality ?? "",
    religion: s.religion ?? "",
    pob_province: s.pob_province ?? "",
    pob_district: s.pob_district ?? "",
    pob_commune: s.pob_commune ?? "",
    pob_village: s.pob_village ?? "",
    cur_province: s.cur_province ?? "",
    cur_district: s.cur_district ?? "",
    cur_commune: s.cur_commune ?? "",
    cur_village: s.cur_village ?? "",
    joinschool: s.joinschool ?? "",
    leftschool: s.leftschool ?? "",
    branchId: s.branch_id ? String(s.branch_id) : "",
    levelId: s.level_id ? String(s.level_id) : "",
    status: s.status === "ACTIVE" ? "active" : "inactive",
    createdAt: s.updated_at?.split("T")[0] ?? "",
  };
}

function toUiEmployee(e: ApiEmployee): Teacher {
  return {
    id: String(e.id),
    user_id: String(e.user_id ?? ""),
    tenant_id: String(e.tenant_id ?? ""),
    school_id: e.school_id != null ? String(e.school_id) : "",
    photo: e.photo ?? "",
    teachercode: e.teachercode ?? "",
    enname: e.enname ?? "",
    khname: e.khname ?? "",
    zhname: e.zhname ?? "",
    gender: e.gender ?? "",
    date_of_birth: e.date_of_birth ?? "",
    nationality: e.nationality ?? "",
    religion: e.religion ?? "",
    pob_province: e.pob_province ?? "",
    pob_district: e.pob_district ?? "",
    pob_commune: e.pob_commune ?? "",
    pob_village: e.pob_village ?? "",
    cur_province: e.cur_province ?? "",
    cur_district: e.cur_district ?? "",
    cur_commune: e.cur_commune ?? "",
    cur_village: e.cur_village ?? "",
    joinwork: e.joinwork ?? "",
    leftwork: e.leftwork ?? "",
    branchId: e.branch_id ? String(e.branch_id) : "",
    subject: "",
    status: e.is_active ? "active" : "inactive",
    createdAt: e.created_at ?? "",
  };
}

function toUiBranch(b: ApiBranch): Branch {
  return {
    id: String(b.id),
    tenant_id: b.tenant_id,
    khname: b.khname,
    enname: b.enname,
    zhname: b.zhname,
    student_code_prefix: b.student_code_prefix ?? "",
    student_code_suffix: b.student_code_suffix ?? "",
    student_code_digit: String(b.student_code_digit ?? 0),
    status: b.status ?? "active",
    createdAt: b.created_at?.split("T")[0] ?? "",
  };
}

function toUiLevel(l: ApiLevel): Level {
  return {
    id: String(l.id),
    school_id: String(l.school_id),
    name: l.name,
    description: l.description,
    display_order: l.display_order,
    status: l.status,
    createdAt: l.created_at?.split("T")[0] ?? "",
  };
}

function toUiReport(r: ApiReport): Report {
  return {
    id: String(r.id),
    title: r.title,
    type: r.type,
    branchId: String(r.branch_id ?? ""),
    teacherId: String(r.teacher_id ?? ""),
    studentId: String(r.student_id ?? ""),
    score: r.score ?? 0,
    date: r.date,
    schoolId: String(r.school_id),
    status: r.status,
  };
}

function getToken(): string {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) throw new Error("Not authenticated");
  return token;
}

export default function SchoolAdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [students, setStudents] = React.useState<Student[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [levels, setLevels] = React.useState<Level[]>([]);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [schools, setSchools] = React.useState<School[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      const [studentsRes, teachersRes, branchesRes, levelsRes, reportsRes, schoolsRes] = await Promise.all([
        getStudents(token),
        getEmployees(token),
        getBranches(token),
        getLevels(token),
        getReports(token),
        getSchools(token),
      ]);
      if (studentsRes?.data) setStudents(studentsRes.data.map(toUiStudent));
      if (teachersRes?.data) setTeachers(teachersRes.data.map(toUiEmployee));
      if (branchesRes?.data) setBranches(branchesRes.data.map(toUiBranch));
      if (levelsRes?.data) setLevels(levelsRes.data.map(toUiLevel));
      if (reportsRes?.data) setReports(reportsRes.data.map(toUiReport));
      if (schoolsRes?.data) setSchools(schoolsRes.data.map((s: ApiSchool) => ({
        id: String(s.id),
        tenant_id: s.tenant_id ?? "",
        user_id: String(s.user_id ?? ""),
        khname: s.khname ?? "",
        enname: s.enname ?? "",
        zhname: s.zhname ?? "",
        student_code_prefix: s.student_code_prefix ?? "",
        student_code_suffix: s.student_code_suffix ?? "",
        student_code_digit: String(s.student_code_digit ?? ""),
        short_school: s.short_school ?? "",
        createdAt: s.created_at ? s.created_at.split("T")[0] : "",
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateSchool = async (payload: SchoolPayload) => {
    await createSchool(getToken(), payload);
    toast.success("School created successfully");
    await loadData();
  };

  const handleUpdateSchool = async (id: number, payload: Partial<SchoolPayload>) => {
    const token = getToken();
    await updateSchoolProfile(token, payload);
    toast.success("School updated successfully");
    await loadData();
  };

  const handleDeleteSchool = async (id: number) => {
    await deleteSchool(getToken(), id);
    toast.success("School deleted successfully");
    await loadData();
  };

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleCreateStudent = async (payload: StudentPayload) => {
    await createStudent(getToken(), payload);
    toast.success("Student created successfully");
    await loadData();
  };

  const handleUpdateStudent = async (id: number, payload: Partial<StudentPayload>) => {
    await updateStudent(getToken(), id, payload);
    toast.success("Student updated successfully");
    await loadData();
  };

  const handleDeleteStudent = async (id: number) => {
    await deleteStudent(getToken(), id);
    toast.success("Student deleted successfully");
    await loadData();
  };

  const handleCreateTeacher = async (payload: EmployeePayload) => {
    await createEmployee(getToken(), payload);
    toast.success("Teacher created successfully");
    await loadData();
  };

  const handleUpdateTeacher = async (id: number, payload: Partial<EmployeePayload>) => {
    await updateEmployee(getToken(), id, payload);
    toast.success("Teacher updated successfully");
    await loadData();
  };

  const handleDeleteTeacher = async (id: number) => {
    await deleteEmployee(getToken(), id);
    toast.success("Teacher deleted successfully");
    await loadData();
  };

  const handleCreateBranch = async (payload: BranchPayload) => {
    await createBranch(getToken(), payload);
    toast.success("Branch created successfully");
    await loadData();
  };

  const handleUpdateBranch = async (id: number, payload: Partial<BranchPayload>) => {
    await updateBranch(getToken(), id, payload);
    toast.success("Branch updated successfully");
    await loadData();
  };

  const handleDeleteBranch = async (id: number) => {
    await deleteBranch(getToken(), id);
    toast.success("Branch deleted successfully");
    await loadData();
  };

  const handleCreateLevel = async (payload: LevelPayload) => {
    await createLevel(getToken(), payload);
    toast.success("Level created successfully");
    await loadData();
  };

  const handleUpdateLevel = async (id: number, payload: Partial<LevelPayload>) => {
    await updateLevel(getToken(), id, payload);
    toast.success("Level updated successfully");
    await loadData();
  };

  const handleDeleteLevel = async (id: number) => {
    await deleteLevel(getToken(), id);
    toast.success("Level deleted successfully");
    await loadData();
  };

  const handleCreateReport = async (payload: ReportPayload) => {
    await createReport(getToken(), payload);
    toast.success("Report created successfully");
    await loadData();
  };

  const handleUpdateReport = async (id: number, payload: Partial<ReportPayload>) => {
    await updateReport(getToken(), id, payload);
    toast.success("Report updated successfully");
    await loadData();
  };

  const handleDeleteReport = async (id: number) => {
    await deleteReport(getToken(), id);
    toast.success("Report deleted successfully");
    await loadData();
  };

  const isAnyLoading = isLoading;

  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const searchDropdownRef = React.useRef<HTMLDivElement>(null)

  const qLower = searchQuery.trim().toLowerCase()

  const filteredStudents = React.useMemo(() => {
    if (!qLower) return []
    return students.filter(
      (s) =>
        s.studentcode?.toLowerCase().includes(qLower) ||
        s.enname?.toLowerCase().includes(qLower) ||
        s.khname?.toLowerCase().includes(qLower) ||
        s.zhname?.toLowerCase().includes(qLower) ||
        s.gender?.toLowerCase().includes(qLower),
    )
  }, [students, qLower])

  const filteredTeachers = React.useMemo(() => {
    if (!qLower) return []
    return teachers.filter(
      (t) =>
        t.teachercode?.toLowerCase().includes(qLower) ||
        t.enname?.toLowerCase().includes(qLower) ||
        t.khname?.toLowerCase().includes(qLower) ||
        t.zhname?.toLowerCase().includes(qLower) ||
        t.gender?.toLowerCase().includes(qLower),
    )
  }, [teachers, qLower])

  const filteredBranches = React.useMemo(() => {
    if (!qLower) return []
    return branches.filter(
      (b) =>
        b.enname?.toLowerCase().includes(qLower) ||
        b.khname?.toLowerCase().includes(qLower) ||
        b.zhname?.toLowerCase().includes(qLower),
    )
  }, [branches, qLower])

  const filteredLevels = React.useMemo(() => {
    if (!qLower) return []
    return levels.filter(
      (l) => l.name?.toLowerCase().includes(qLower),
    )
  }, [levels, qLower])

  const filteredReports = React.useMemo(() => {
    if (!qLower) return []
    return reports.filter(
      (r) =>
        r.title?.toLowerCase().includes(qLower) ||
        r.type?.toLowerCase().includes(qLower),
    )
  }, [reports, qLower])

  const filteredSchools = React.useMemo(() => {
    if (!qLower) return []
    return schools.filter(
      (s) =>
        s.enname?.toLowerCase().includes(qLower) ||
        s.khname?.toLowerCase().includes(qLower) ||
        s.zhname?.toLowerCase().includes(qLower) ||
        s.short_school?.toLowerCase().includes(qLower) ||
        s.tenant_id?.toLowerCase().includes(qLower),
    )
  }, [schools, qLower])

  const flatItems = React.useMemo(() => {
    const items: { type: string; id: string }[] = []
    filteredStudents.slice(0, 5).forEach((s) => items.push({ type: "student", id: String(s.id) }))
    filteredTeachers.slice(0, 5).forEach((t) => items.push({ type: "teacher", id: String(t.id) }))
    filteredBranches.slice(0, 5).forEach((b) => items.push({ type: "branch", id: String(b.id) }))
    filteredLevels.slice(0, 5).forEach((l) => items.push({ type: "level", id: String(l.id) }))
    filteredReports.slice(0, 5).forEach((r) => items.push({ type: "report", id: String(r.id) }))
    filteredSchools.slice(0, 5).forEach((s) => items.push({ type: "school", id: String(s.id) }))
    return items
  }, [filteredStudents, filteredTeachers, filteredBranches, filteredLevels, filteredReports, filteredSchools])

  const totalResults = flatItems.length

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    setShowSearchDropdown(val.length > 0)
    setActiveIndex(-1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchDropdown || totalResults === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
    }
  }

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSearchDropdown(false)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <ProtectedRoute allowedUserTypes={["SCHOOL_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6" suppressHydrationWarning>
                <SectionCards
                  studentCount={students.length}
                  teacherCount={teachers.length}
                  branchCount={branches.length}
                  levelCount={levels.length}
                  reportCount={reports.length}
                  isLoading={isAnyLoading}
                />
                {error ? (
                  <Alert variant="destructive" className="mx-4 lg:mx-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="px-3 lg:px-4" ref={searchRef}>
                  <div className="relative">
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>
                          <IconSearch className="size-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        type="search"
                        placeholder="Search students, teachers, branches, and more..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true) }}
                        onKeyDown={handleSearchKeyDown}
                      />
                      {searchQuery && (
                        <InputGroupAddon align="inline-end">
                          <button
                            onClick={() => { setSearchQuery(""); setShowSearchDropdown(false) }}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <IconX className="size-4" />
                          </button>
                        </InputGroupAddon>
                      )}
                    </InputGroup>

                    {showSearchDropdown && (
                      <div
                        ref={searchDropdownRef}
                        className="absolute top-full left-4 right-4 z-50 mt-1 max-h-96 overflow-y-auto rounded-xl border bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
                      >
                        {searchQuery.trim() ? (
                          <>
                            {totalResults > 0 && (
                              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-muted/30">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Found <strong className="text-foreground">{totalResults}</strong> result{totalResults !== 1 ? "s" : ""}
                                </span>
                                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-70">
                                  <span className="text-xs">↑↓</span> navigate
                                </kbd>
                              </div>
                            )}
                            {filteredStudents.length > 0 && (
                              <div className="divide-y divide-border/50">
                                <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-popover border-b border-border/50">
                                  <IconUser className="h-3.5 w-3.5 text-blue-500" />
                                  <span>Students</span>
                                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 text-[10px] font-bold">{filteredStudents.length}</span>
                                </div>
                                {filteredStudents.slice(0, 5).map((s) => (
                                  <div key={s.id} className="flex items-center gap-3 px-3 py-2 text-sm transition-all hover:bg-accent/50 border-l-2 border-transparent hover:border-blue-500 cursor-default">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                      <IconUser className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-foreground">{s.khname || s.enname || s.studentcode || ""}</div>
                                      <div className="truncate text-xs text-muted-foreground">{[s.enname, s.studentcode].filter(Boolean).join(" · ")}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {filteredTeachers.length > 0 && (
                              <div className="divide-y divide-border/50">
                                <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-popover border-b border-border/50">
                                  <IconUsers className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Teachers</span>
                                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-bold">{filteredTeachers.length}</span>
                                </div>
                                {filteredTeachers.slice(0, 5).map((t) => (
                                  <div key={t.id} className="flex items-center gap-3 px-3 py-2 text-sm transition-all hover:bg-accent/50 border-l-2 border-transparent hover:border-amber-500 cursor-default">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100/50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                      <IconUsers className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-foreground">{t.khname || t.enname || t.teachercode || ""}</div>
                                      <div className="truncate text-xs text-muted-foreground">{[t.enname, t.teachercode].filter(Boolean).join(" · ")}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {filteredBranches.length > 0 && (
                              <div className="divide-y divide-border/50">
                                <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-popover border-b border-border/50">
                                  <IconBuilding className="h-3.5 w-3.5 text-indigo-500" />
                                  <span>Branches</span>
                                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 text-[10px] font-bold">{filteredBranches.length}</span>
                                </div>
                                {filteredBranches.slice(0, 5).map((b) => (
                                  <div key={b.id} className="flex items-center gap-3 px-3 py-2 text-sm transition-all hover:bg-accent/50 border-l-2 border-transparent hover:border-indigo-500 cursor-default">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100/50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                                      <IconBuilding className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-foreground">{b.khname || b.enname || ""}</div>
                                      <div className="truncate text-xs text-muted-foreground">{[b.enname, b.zhname].filter(Boolean).join(" · ")}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {filteredLevels.length > 0 && (
                              <div className="divide-y divide-border/50">
                                <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-popover border-b border-border/50">
                                  <IconBook className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Levels</span>
                                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold">{filteredLevels.length}</span>
                                </div>
                                {filteredLevels.slice(0, 5).map((l) => (
                                  <div key={l.id} className="flex items-center gap-3 px-3 py-2 text-sm transition-all hover:bg-accent/50 border-l-2 border-transparent hover:border-emerald-500 cursor-default">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                      <IconBook className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-foreground">{l.name || ""}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {filteredReports.length > 0 && (
                              <div className="divide-y divide-border/50">
                                <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-popover border-b border-border/50">
                                  <IconClipboardList className="h-3.5 w-3.5 text-red-500" />
                                  <span>Reports</span>
                                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 text-[10px] font-bold">{filteredReports.length}</span>
                                </div>
                                {filteredReports.slice(0, 5).map((r) => (
                                  <div key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm transition-all hover:bg-accent/50 border-l-2 border-transparent hover:border-red-500 cursor-default">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                      <IconClipboardList className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-foreground">{r.title || ""}</div>
                                      <div className="truncate text-xs text-muted-foreground">{r.type || ""}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {filteredSchools.length > 0 && (
                              <div className="divide-y divide-border/50">
                                <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-popover border-b border-border/50">
                                  <IconBuildingSkyscraper className="h-3.5 w-3.5 text-orange-500" />
                                  <span>Schools</span>
                                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 text-[10px] font-bold">{filteredSchools.length}</span>
                                </div>
                                {filteredSchools.slice(0, 5).map((school) => (
                                  <div key={school.id} className="flex items-center gap-3 px-3 py-2 text-sm transition-all hover:bg-accent/50 border-l-2 border-transparent hover:border-orange-500 cursor-default">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100/50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                      <IconSchool className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-foreground">{school.enname || school.khname || "-"}</div>
                                      <div className="truncate text-xs text-muted-foreground">{[school.khname, school.short_school].filter(Boolean).join(" · ")}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {[
                              filteredStudents,
                              filteredTeachers,
                              filteredBranches,
                              filteredLevels,
                              filteredReports,
                              filteredSchools,
                            ].every((arr) => arr.length === 0) && (
                              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                  <IconSearch className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="text-sm font-medium text-foreground">No results found</div>
                                <div className="text-xs text-muted-foreground">No results match &quot;{searchQuery}&quot;</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <IconSearch className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="text-sm font-medium text-foreground">Search everything</div>
                            <div className="text-xs text-muted-foreground">Start typing to search across all data...</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-3 lg:px-4 flex flex-col gap-4">
                  <CollapsibleSection
                    title="Student"
                    icon={<IconUser className="h-5 w-5 text-green-500" />}
                    count={students.length}
                    defaultOpen
                  >
                    <StudentTable
                      data={students}
                      isLoading={isLoading}
                      branchOptions={branches}
                      levelOptions={levels.map((l) => ({ id: l.id, name: l.name }))}
                      hideDelete={true}
                      onCreate={handleCreateStudent}
                      onUpdate={handleUpdateStudent}
                      onDelete={handleDeleteStudent}
                    />
                  </CollapsibleSection>
 
                  <CollapsibleSection
                    title="Teacher"
                    icon={<IconUsers className="h-5 w-5 text-yellow-500" />}
                    count={teachers.length}
                    defaultOpen
                  >
                    <TeacherTable
                      data={teachers}
                      isLoading={isLoading}
                      branchOptions={branches}
                      hideDelete={true}
                      onCreate={handleCreateTeacher}
                      onUpdate={handleUpdateTeacher}
                      onDelete={handleDeleteTeacher}
                    />
                  </CollapsibleSection>
 
                  <CollapsibleSection
                    title="Level"
                    icon={<IconBook className="h-5 w-5 text-blue-500" />}
                    count={levels.length}
                    defaultOpen
                  >
                    <LevelTable
                      data={levels}
                      isLoading={isLoading}
                      hideDelete={true}
                      onCreate={handleCreateLevel}
                      onUpdate={handleUpdateLevel}
                      onDelete={handleDeleteLevel}
                    />
                  </CollapsibleSection>
 
                  <CollapsibleSection
                    title="Report"
                    icon={<IconReport className="h-5 w-5 text-red-500" />}
                    count={reports.length}
                    defaultOpen
                  >
                    <ReportTable
                      data={reports}
                      isLoading={isLoading}
                      branchOptions={branches}
                      teacherOptions={teachers.map((t: { id: string; enname?: string; khname?: string }) => ({ id: t.id, name: t.enname || t.khname || t.id }))}
                      studentOptions={students.map((s: { id: string; enname?: string; khname?: string }) => ({ id: s.id, name: s.enname || s.khname || s.id }))}
                      onCreate={handleCreateReport}
                      onUpdate={handleUpdateReport}
                      onDelete={handleDeleteReport}
                      hideDelete={true}
                    />
                  </CollapsibleSection>
 
                  <CollapsibleSection
                    title="Branch"
                    icon={<IconBuilding className="h-5 w-5 text-indigo-500" />}
                    count={branches.length}
                    defaultOpen
                  >
                    <BranchTable
                      data={branches}
                      isLoading={isLoading}
                      hideDelete={true}
                      onCreate={handleCreateBranch}
                      onUpdate={handleUpdateBranch}
                      onDelete={handleDeleteBranch}
                    />
                  </CollapsibleSection>
 
                  <CollapsibleSection
                    title="School"
                    icon={<IconSchool className="h-5 w-5 text-orange-500" />}
                    count={schools.length}
                    defaultOpen
                  >
                    <SchoolTable
                      data={schools}
                      isLoading={isLoading}
                      onCreate={handleCreateSchool}
                      onUpdate={handleUpdateSchool}
                      onView={(id) => router.push(`/dashboard/school/view/${id}`)}
                    />
                  </CollapsibleSection>
              </div>
            </div>
          </div>
    </ProtectedRoute>
  );
}
