"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { GlobalSearch } from "@/components/global-search"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/hooks/use-language"
import { IconLayoutDashboard } from "@tabler/icons-react"
import * as React from "react"

const pageTitles: Record<string, { title: string; icon?: React.ReactNode }> = {
  "/dashboard": { title: "dashboard.title", icon: <IconLayoutDashboard className="size-3.5" /> },
  "/dashboard/super-admin": { title: "dashboard.superAdmin" },
  "/dashboard/school-admin": { title: "dashboard.schoolAdmin" },
  "/dashboard/Branch": { title: "dashboard.branch" },
  "/dashboard/Student": { title: "dashboard.student" },
  "/dashboard/Teacher": { title: "dashboard.teacher" },
  "/dashboard/Level": { title: "dashboard.level" },
  "/dashboard/Report": { title: "dashboard.report" },
}

export function SiteHeader() {
  const pathname = usePathname()
  const { t, mounted } = useLanguage()

  const getTitle = () => {
    for (const [path, info] of Object.entries(pageTitles)) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return { title: t(info.title), icon: info.icon }
      }
    }
    return { title: t("dashboard.title") }
  }

  const { title, icon } = getTitle()

  if (!mounted) {
    return (
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm transition-[width,height] duration-[var(--sidebar-transition-duration,300ms)] ease-[cubic-bezier(0.4,0,0.2,1)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-3 lg:gap-2 lg:px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <div className="flex items-center gap-2">
            {icon && (
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                {icon}
              </span>
            )}
            <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          </div>
          <div className="flex-1" />
          <GlobalSearch />
          <NotificationBell />
          <LanguageToggle />
          <ModeToggle />
        </div>
      </header>
    )
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm transition-[width,height] duration-[var(--sidebar-transition-duration,300ms)] ease-[cubic-bezier(0.4,0,0.2,1)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-3 lg:gap-2 lg:px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex-1" />
        <GlobalSearch />
        <NotificationBell />
        <LanguageToggle />
        <ModeToggle />
      </div>
    </header>
  )
}
