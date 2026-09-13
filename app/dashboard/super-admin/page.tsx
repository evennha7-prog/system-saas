"use client"

export const dynamic = "force-dynamic"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SchoolTable } from "./school-table"
import { SendMessageForm } from "./send-message-form"
import { SentMessages } from "./sent-messages"
import { AdminTable } from "./admin-table"
import { SectionCards } from "@/components/section-cards"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { CollapsibleSection } from "@/components/collapsible-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { translations } from "@/lib/translations"
import { ProtectedRoute } from "@/lib/protected-route"
import { useAuth } from "@/lib/auth-context"
import { AUTH_TOKEN_KEY, getReports, getStudents, getEmployees, getBranches, getLevels, getSchools, getUsers, type ApiReport, type ApiStudent, type ApiEmployee, type ApiBranch, type ApiLevel, type ApiSchool, type ApiUser } from "@/lib/api"
import { IconRefresh, IconSchool, IconMessage, IconBuildingSkyscraper, IconReport, IconUsers, IconSearch, IconUser, IconBuilding, IconBook, IconClipboardList, IconX } from "@tabler/icons-react"

function useLanguage() {
  const [language, setLanguage] = React.useState("en")

  React.useEffect(() => {
    const saved = localStorage.getItem("language")
    if (saved && ["en", "km", "zh"].includes(saved)) {
      setLanguage(saved)
    }
    const handleChange = () => {
      const saved = localStorage.getItem("language")
      if (saved && ["en", "km", "zh"].includes(saved)) {
        setLanguage(saved)
      }
    }
    window.addEventListener("languagechange", handleChange)
    return () => window.removeEventListener("languagechange", handleChange)
  }, [])

  return language
}

const t = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}

function getToken(): string {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) throw new Error("Not authenticated")
  return token
}

export default function SuperAdminPage() {
  const language = useLanguage()
  const router = useRouter()

  const [students, setStudents] = React.useState<ApiStudent[]>([])
  const [teachers, setTeachers] = React.useState<ApiEmployee[]>([])
  const [branches, setBranches] = React.useState<ApiBranch[]>([])
  const [levels, setLevels] = React.useState<ApiLevel[]>([])
  const [reports, setReports] = React.useState<ApiReport[]>([])
  const [schools, setSchools] = React.useState<ApiSchool[]>([])
  const [users, setUsers] = React.useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [msgTabKey, setMsgTabKey] = React.useState("compose")

  const loadDashboard = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = getToken()
      const [sRes, tRes, bRes, lRes, rRes, schRes, uRes] = await Promise.all([
        getStudents(token),
        getEmployees(token),
        getBranches(token),
        getLevels(token),
        getReports(token),
        getSchools(token),
        getUsers(token),
      ])
      if (sRes?.data) setStudents(sRes.data)
      if (tRes?.data) setTeachers(tRes.data)
      if (bRes?.data) setBranches(bRes.data)
      if (lRes?.data) setLevels(lRes.data)
      if (rRes?.data) setReports(rRes.data)
      if (schRes?.data) setSchools(schRes.data)
      if (uRes?.data) setUsers(uRes.data)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const { user } = useAuth()

  const [msgRefreshKey, setMsgRefreshKey] = React.useState(0)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const searchDropdownRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

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

  const filteredUsers = React.useMemo(() => {
    if (!qLower) return []
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(qLower) ||
        u.email?.toLowerCase().includes(qLower) ||
        u.phonenumber?.toLowerCase().includes(qLower) ||
        u.user_type?.toLowerCase().includes(qLower),
    )
  }, [users, qLower])

  const flatItems = React.useMemo(() => {
    const items: { type: string; id: string }[] = []
    filteredStudents.slice(0, 5).forEach((s) => items.push({ type: "student", id: String(s.id) }))
    filteredTeachers.slice(0, 5).forEach((t) => items.push({ type: "teacher", id: String(t.id) }))
    filteredBranches.slice(0, 5).forEach((b) => items.push({ type: "branch", id: String(b.id) }))
    filteredLevels.slice(0, 5).forEach((l) => items.push({ type: "level", id: String(l.id) }))
    filteredReports.slice(0, 5).forEach((r) => items.push({ type: "report", id: String(r.id) }))
    filteredSchools.slice(0, 5).forEach((s) => items.push({ type: "school", id: String(s.id) }))
    filteredUsers.slice(0, 5).forEach((u) => items.push({ type: "user", id: String(u.id) }))
    return items
  }, [filteredStudents, filteredTeachers, filteredBranches, filteredLevels, filteredReports, filteredSchools, filteredUsers])

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
      const selected = flatItems[activeIndex]
      if (selected.type === "school") {
        setShowSearchDropdown(false)
        document.getElementById("school-section")?.scrollIntoView({ behavior: "smooth" })
      } else if (selected.type === "user") {
        setShowSearchDropdown(false)
        document.getElementById("users-section")?.scrollIntoView({ behavior: "smooth" })
      }
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

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["SUPER_ADMIN"]}>
        <DashboardSkeleton />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards
                  studentCount={students.length}
                  teacherCount={teachers.length}
                  branchCount={branches.length}
                  levelCount={levels.length}
                  reportCount={reports.length}
                  isLoading={isLoading}
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
                        placeholder="Search schools, users, and more..."
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
                                  <button
                                    key={school.id}
                                    onClick={() => {
                                      setShowSearchDropdown(false)
                                      document.getElementById("school-section")?.scrollIntoView({ behavior: "smooth" })
                                    }}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-sm transition-all hover:bg-accent/50 border-l-2 border-transparent hover:border-orange-500 text-left"
                                  >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100/50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                      <IconSchool className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-foreground">{school.enname || school.khname || "-"}</div>
                                      <div className="truncate text-xs text-muted-foreground">{[school.khname, school.short_school].filter(Boolean).join(" · ")}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {filteredUsers.length > 0 && (
                              <div className="divide-y divide-border/50">
                                <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-popover border-b border-border/50">
                                  <IconUsers className="h-3.5 w-3.5 text-purple-500" />
                                  <span>Users</span>
                                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 text-[10px] font-bold">{filteredUsers.length}</span>
                                </div>
                                {filteredUsers.slice(0, 5).map((user) => (
                                  <button
                                    key={user.id}
                                    onClick={() => {
                                      setShowSearchDropdown(false)
                                      document.getElementById("users-section")?.scrollIntoView({ behavior: "smooth" })
                                    }}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-sm transition-all hover:bg-accent/50 border-l-2 border-transparent hover:border-purple-500 text-left"
                                  >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100/50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                      <IconUser className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-foreground">{user.username || user.email || "-"}</div>
                                      <div className="truncate text-xs text-muted-foreground">{user.email || user.phonenumber || ""}</div>
                                    </div>
                                  </button>
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
                              filteredUsers,
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
                  <div id="school-section">
                    <CollapsibleSection
                      title={t("sidebar.schoolManagement", language)}
                      icon={<IconSchool className="h-5 w-5 text-green-500" />}
                      count={schools.length}
                      defaultOpen
                    >
                      <SchoolTable onView={(id) => router.push(`/dashboard/school/view/${id}`)} />
                    </CollapsibleSection>
                  </div>

                  <CollapsibleSection
                    title="Messages"
                    icon={<IconMessage className="h-5 w-5 text-pink-500" />}
                    defaultOpen
                  >
                    <div>
                      <Tabs value={msgTabKey} onValueChange={setMsgTabKey}>
                        <TabsList>
                          <TabsTrigger value="compose">Compose</TabsTrigger>
                          <TabsTrigger value="sent">Sent Messages</TabsTrigger>
                        </TabsList>
                        <TabsContent value="compose" className="mt-4">
                          <SendMessageForm
                            onSent={() => {
                              setMsgRefreshKey((k) => k + 1)
                              setMsgTabKey("sent")
                            }}
                          />
                        </TabsContent>
                        <TabsContent value="sent" className="mt-4">
                          <SentMessages key={msgRefreshKey} />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CollapsibleSection>

                  <div id="users-section">
                    <CollapsibleSection
                      title="User Management"
                      icon={<IconUsers className="h-5 w-5 text-blue-500" />}
                      defaultOpen
                    >
                      <AdminTable searchQuery={searchQuery} />
                    </CollapsibleSection>
                  </div>

                  <CollapsibleSection
                    title={t("sidebar.systemSettings", language)}
                    icon={<IconBuildingSkyscraper className="h-5 w-5 text-orange-500" />}
                    defaultOpen
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>General Settings</CardTitle>
                          <CardDescription>Configure app name, logo, and timezone</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="appName">App Name</Label>
                            <Input id="appName" defaultValue="NK ONE School" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Input id="timezone" defaultValue="Asia/Phnom_Penh" />
                          </div>
                          <Button>Save Changes</Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Features</CardTitle>
                          <CardDescription>Enable or disable system features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Multi-School</Label>
                            <Button variant="outline" size="sm">Enabled</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Reports</Label>
                            <Button variant="outline" size="sm">Enabled</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Notifications</Label>
                            <Button variant="outline" size="sm">Enabled</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Roles & Permissions</CardTitle>
                          <CardDescription>Manage user roles and access permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">Role management coming soon...</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection
                    title={t("sidebar.reports", language)}
                    icon={<IconReport className="h-5 w-5 text-red-500" />}
                    count={schools.length}
                    defaultOpen
                  >
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {schools.length} school(s)
                        </div>
                        <Button variant="outline" size="sm" onClick={loadDashboard} disabled={isLoading}>
                          <IconRefresh className="mr-1 h-4 w-4" />
                          Refresh
                        </Button>
                      </div>
                      <div className="rounded-md border min-h-[200px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>School Name</TableHead>
                              <TableHead>Khmer Name</TableHead>
                              <TableHead>Short Name</TableHead>
                              <TableHead>Tenant ID</TableHead>
                              <TableHead>Students</TableHead>
                              <TableHead>Teachers</TableHead>
                              <TableHead>Branches</TableHead>
                              <TableHead>Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {schools.length ? (
                              schools.map((s) => {
                                const studentCount = students.filter((st) => st.school_id === s.id).length
                                const teacherCount = teachers.filter((t) => t.school_id === s.id).length
                                const branchCount = branches.filter((b) => b.school_id === s.id).length
                                return (
                                  <TableRow key={s.id}>
                                    <TableCell className="font-medium">{s.enname || "-"}</TableCell>
                                    <TableCell>{s.khname || "-"}</TableCell>
                                    <TableCell><Badge variant="secondary">{s.short_school || "-"}</Badge></TableCell>
                                    <TableCell className="font-mono text-xs">{s.tenant_id || "-"}</TableCell>
                                    <TableCell>{studentCount}</TableCell>
                                    <TableCell>{teacherCount}</TableCell>
                                    <TableCell>{branchCount}</TableCell>
                                    <TableCell className="text-sm">
                                      {s.created_at ? new Date(s.created_at).toISOString().split("T")[0] : "-"}
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                  {isLoading ? "Loading..." : "No schools found."}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
