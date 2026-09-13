"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import {
  IconUser,
  IconUsers,
  IconBuilding,
  IconBook,
  IconClipboardList,
  IconBuildingSkyscraper,
  IconChevronRight,
  IconSearch,
  IconLoader2,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { translations } from "@/lib/translations"
import { globalSearch, AUTH_TOKEN_KEY, type ApiStudent, type ApiEmployee, type ApiBranch, type ApiLevel, type ApiReport, type ApiSchool, type ApiUser } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"


function useLanguage() {
  const [language, setLanguage] = React.useState("en")

  React.useEffect(() => {
    const saved = localStorage.getItem("language")
    if (saved && ["en", "km", "zh"].includes(saved)) {
      setLanguage(saved)
    }
  }, [])

  return language
}

const t = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const SearchContext = React.createContext<SearchContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
})

export function useSearch() {
  return React.useContext(SearchContext)
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  )
}

type ResultCategory = {
  key: string
  label: string
  icon: React.ReactNode
  color?: string
  items: (ApiStudent | ApiEmployee | ApiBranch | ApiLevel | ApiReport | ApiSchool)[]
  getLabel: (item: unknown) => string
  getSecondary: (item: unknown) => string
  link: string
}

export function GlobalSearch() {
  const language = useLanguage()
  const { searchQuery, setSearchQuery } = useSearch()
  const { user } = useAuth()
  const [results, setResults] = React.useState<Record<string, unknown[]> | null>(null)
  const [isSearching, setIsSearching] = React.useState(false)
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
  const inputRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowDropdown(value.length > 0)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY)
        if (!token) {
          setIsSearching(false)
          return
        }
        const data = await globalSearch(token, value)
        setResults(data as unknown as Record<string, unknown[]>)
      } catch {
        setResults(null)
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  const handleFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true)
    }
  }

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [])

  React.useEffect(() => {
    if (!showDropdown) return

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownStyle({
          position: "fixed",
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        })
      }
    }

    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [showDropdown])

  const categories: ResultCategory[] = React.useMemo(() => {
    if (!results) return []
    const isSuperAdmin = user?.user_type === "SUPER_ADMIN"

    const catConfig: Record<string, Omit<ResultCategory, "key" | "items"> & { color?: string }> = {
      ...(isSuperAdmin
        ? {
            students: {
              label: "Students",
              icon: <IconUser className="h-4 w-4 text-green-500" />,
              color: "green",
              getLabel: (item) => {
                const s = item as ApiStudent
                return s.khname || s.enname || s.studentcode || ""
              },
              getSecondary: (item) => {
                const s = item as ApiStudent
                const parts = [s.enname, s.zhname, s.studentcode].filter(Boolean)
                return parts.join(" · ")
              },
              link: "/dashboard/tool-management",
            },
            employees: {
              label: "Teachers",
              icon: <IconUsers className="h-4 w-4 text-yellow-500" />,
              color: "yellow",
              getLabel: (item) => {
                const e = item as ApiEmployee
                return e.khname || e.enname || e.teachercode || ""
              },
              getSecondary: (item) => {
                const e = item as ApiEmployee
                const parts = [e.enname, e.zhname, e.teachercode].filter(Boolean)
                return parts.join(" · ")
              },
              link: "/dashboard/tool-management",
            },
          }
        : {
            students: {
              label: "Students",
              icon: <IconUser className="h-4 w-4 text-green-500" />,
              color: "green",
              getLabel: (item) => {
                const s = item as ApiStudent
                return s.khname || s.enname || s.studentcode || ""
              },
              getSecondary: (item) => {
                const s = item as ApiStudent
                const parts = [s.enname, s.zhname, s.studentcode].filter(Boolean)
                return parts.join(" · ")
              },
              link: "/dashboard/Student",
            },
            employees: {
              label: "Teachers",
              icon: <IconUsers className="h-4 w-4 text-yellow-500" />,
              color: "yellow",
              getLabel: (item) => {
                const e = item as ApiEmployee
                return e.khname || e.enname || e.teachercode || ""
              },
              getSecondary: (item) => {
                const e = item as ApiEmployee
                const parts = [e.enname, e.zhname, e.teachercode].filter(Boolean)
                return parts.join(" · ")
              },
              link: "/dashboard/Teacher",
            },
          }),
      branches: {
        label: "Branches",
        icon: <IconBuilding className="h-4 w-4 text-indigo-500" />,
        color: "indigo",
        getLabel: (item) => {
          const b = item as ApiBranch
          return b.khname || b.enname || ""
        },
        getSecondary: (item) => {
          const b = item as ApiBranch
          const parts = [b.enname, b.zhname].filter(Boolean)
          return parts.join(" · ")
        },
        link: "/dashboard/Branch",
      },
      levels: {
        label: "Levels",
        icon: <IconBook className="h-4 w-4 text-blue-500" />,
        color: "blue",
        getLabel: (item) => (item as ApiLevel).name || "",
        getSecondary: () => "",
        link: "/dashboard/Level",
      },
      reports: {
        label: "Reports",
        icon: <IconClipboardList className="h-4 w-4 text-red-500" />,
        color: "red",
        getLabel: (item) => (item as ApiReport).title || "",
        getSecondary: (item) => (item as ApiReport).type || "",
        link: "/dashboard/Report",
      },
      ...(isSuperAdmin
        ? {
            schools: {
              label: "Schools",
              icon: <IconBuildingSkyscraper className="h-4 w-4 text-green-500" />,
              color: "green",
              getLabel: (item) => {
                const s = item as ApiSchool
                return s.khname || s.enname || ""
              },
              getSecondary: (item) => {
                const s = item as ApiSchool
                const parts = [s.enname, s.zhname].filter(Boolean)
                return parts.join(" · ")
              },
              link: "/dashboard/school",
            },
          }
        : {}),
      users: {
        label: "Users",
        icon: <IconUsers className="h-4 w-4 text-purple-500" />,
        color: "purple",
        getLabel: (item) => {
          const u = item as ApiUser
          const name = u.username || u.email || ""
          if (u.user_type === "SUPER_ADMIN") return `${name} (Super Admin)`
          if (u.school_name) return `${name} — ${u.school_name}`
          return name
        },
        getSecondary: (item) => {
          const u = item as ApiUser
          if (u.user_type === "SUPER_ADMIN") return "Full system access · All schools"
          const parts = [u.email, u.phonenumber].filter(Boolean)
          return parts.join(" · ")
        },
        link: "/dashboard/users",
      },
    }

    return (Object.entries(results) as [string, unknown[]][])
      .filter(([, items]) => items.length > 0)
      .map(([key, items]) => {
        const config = catConfig[key]
        if (!config) return null
        return { key, ...config, items }
      })
      .filter(Boolean) as ResultCategory[]
  }, [results, user])

  const totalResults = React.useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories],
  )

  return (
    <div className="relative w-full max-w-sm" ref={inputRef}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>
            {isSearching ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconSearch className="size-4" />
            )}
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder={t("table.globalSearch", language)}
          value={searchQuery}
          onChange={handleSearch}
          onFocus={handleFocus}
        />
      </InputGroup>

      {showDropdown && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={cn(
            "z-[100] max-h-64 overflow-y-auto rounded-3xl bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10",
          )}
        >
          {totalResults === 0 && !isSearching ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            categories.map((category, catIdx) => (
              <React.Fragment key={category.key}>
                {catIdx > 0 && <div className="-mx-1.5 my-1.5 h-px bg-border/50" />}
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <span className={cn(
                    category.color === "green" && "text-green-500",
                    category.color === "yellow" && "text-yellow-500",
                    category.color === "blue" && "text-blue-500",
                    category.color === "indigo" && "text-indigo-500",
                    category.color === "red" && "text-red-500",
                    category.color === "purple" && "text-purple-500",
                    category.color === "gray" && "text-gray-500",
                  )}>
                    {category.icon}
                  </span>
                  <span>{category.label}</span>
                  <span className="ml-auto text-xs">({category.items.length})</span>
                </div>
                {category.items.slice(0, 5).map((item, idx) => (
                  <Link
                    key={idx}
                    href={category.link}
                    onClick={() => setShowDropdown(false)}
                    className="group relative flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium outline-hidden select-none hover:bg-accent hover:text-accent-foreground transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">
                        {category.getLabel(item)}
                      </div>
                      {category.getSecondary(item) && (
                        <div className="truncate text-xs text-muted-foreground">
                          {category.getSecondary(item)}
                        </div>
                      )}
                    </div>
                    <IconChevronRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </Link>
                ))}
                {category.items.length > 5 && (
                  <Link
                    href={category.link}
                    onClick={() => setShowDropdown(false)}
                    className="relative flex items-center justify-center gap-2 rounded-2xl px-2 py-1.5 text-xs font-medium outline-hidden select-none hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    View all {category.items.length} {category.label.toLowerCase()}
                  </Link>
                )}
              </React.Fragment>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
