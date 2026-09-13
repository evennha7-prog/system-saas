"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { IconChevronDown, IconMinus } from "@tabler/icons-react"

type NavItem = {
  title: string
  url?: string
  icon?: React.ReactNode
  color?: string
  children?: NavItem[]
}

const colorStyles: Record<string, { bar: string; activeBg: string; text: string; glow: string }> = {
  green:  { bar: "bg-green-500", activeBg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", glow: "shadow-green-500/20" },
  blue:   { bar: "bg-blue-500", activeBg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", glow: "shadow-blue-500/20" },
  orange: { bar: "bg-orange-500", activeBg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", glow: "shadow-orange-500/20" },
  cyan:   { bar: "bg-cyan-500", activeBg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", glow: "shadow-cyan-500/20" },
  pink:   { bar: "bg-pink-500", activeBg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", glow: "shadow-pink-500/20" },
  gray:   { bar: "bg-gray-500", activeBg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", glow: "shadow-gray-500/20" },
}

function getCS(color?: string) {
  return color ? colorStyles[color] : undefined
}

function ActiveBar({ cs, active }: { cs?: { bar: string }; active: boolean }) {
  return (
    <div
      className={cn(
        "w-[3px] shrink-0 self-stretch rounded-full transition-all duration-200",
        active ? (cs?.bar || "bg-primary") : "bg-transparent group-hover/menu-item:bg-sidebar-border/50"
      )}
    />
  )
}

const LeafNavItem = React.memo(function LeafNavItem({
  item,
  active,
}: {
  item: NavItem
  active: boolean
}) {
  const cs = getCS(item.color)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
        <Link
          href={item.url || "#"}
          className={cn(
            "flex items-center gap-2 rounded-lg font-medium group/menu-link group",
            active
              ? cn(cs?.activeBg || "bg-primary/10", cs?.text || "text-primary", "shadow-sm", cs?.glow)
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <ActiveBar cs={cs} active={active} />
          <span className={cn(
            "shrink-0 flex items-center justify-center rounded-xl",
            "group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:ring-1 group-data-[collapsible=icon]:ring-sidebar-border/0 group-data-[collapsible=icon]:hover:ring-sidebar-border/40",
            active
              ? cn(cs?.activeBg || "bg-primary/10", cs?.text || "text-primary", "shadow-sm", "group-data-[collapsible=icon]:ring-sidebar-border/20")
              : cn(
                  "text-muted-foreground group-hover/menu-link:bg-sidebar-accent group-hover/menu-link:scale-110",
                  "group-data-[collapsible=icon]:opacity-75 group-data-[collapsible=icon]:group-hover/menu-link:opacity-100 group-data-[collapsible=icon]:group-hover/menu-link:bg-sidebar-accent/80 group-data-[collapsible=icon]:group-hover/menu-link:scale-100"
                )
          )}>
            {item.icon}
          </span>
          <span className="whitespace-normal leading-tight">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})

const MemoizedCollapsibleNavGroup = React.memo(CollapsibleNavGroup)

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  const isActive = React.useCallback(
    (url?: string) => {
      if (!url) return false
      return pathname === url || pathname.startsWith(url + "/")
    },
    [pathname]
  )

  const hasActiveChild = React.useCallback(
    (item: NavItem): boolean => {
      if (!item.children) return false
      return item.children.some((child) => isActive(child.url) || hasActiveChild(child))
    },
    [isActive]
  )

  if (items.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <IconMinus className="h-5 w-5 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/50">No matching items</p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu style={{ fontSize: 6 }}>
          {items.map((item) => {
            if (item.children && item.children.length > 0) {
              return (
                <MemoizedCollapsibleNavGroup
                  key={item.title}
                  item={item}
                  isActive={isActive}
                  hasActiveChild={hasActiveChild}
                />
              )
            }
            const active = isActive(item.url)
            return (
              <LeafNavItem key={item.title} item={item} active={active} />
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NestedCollapsibleGroup({
  item,
  childActive,
  childCS,
  isActive,
}: {
  item: NavItem
  childActive: boolean
  childCS?: { bar: string; activeBg: string; text: string; glow: string }
  isActive: (url?: string) => boolean
}) {
  const [open, setOpen] = React.useState(() => storedOpen[item.title] ?? childActive)

  React.useEffect(() => {
    storedOpen[item.title] = open
  }, [open, item.title])

  return (
    <>
      <SidebarMenuSubButton
        isActive={childActive}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg font-medium transition-all duration-150 group/menu-link group cursor-pointer",
          childActive
            ? cn(childCS?.activeBg || "bg-primary/10", childCS?.text || "text-primary font-medium", "shadow-sm")
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <ActiveBar cs={childCS} active={childActive} />
        {item.icon && (
          <span className={cn(
            "shrink-0 transition-all duration-150",
            childActive ? (childCS?.text || "text-primary") : "text-muted-foreground"
          )}>
            {item.icon}
          </span>
        )}
        <span className="flex-1 whitespace-normal leading-tight">{item.title}</span>
        <IconChevronDown
          className={cn(
            "h-3 w-3 shrink-0 transition-all duration-200",
            "text-muted-foreground/40",
            open && "rotate-180"
          )}
        />
      </SidebarMenuSubButton>
      <div
        className={cn(
          "grid transition-all duration-[var(--sidebar-transition-duration,300ms)] ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {item.children && (
            <SidebarMenuSub>
              {item.children.map((grandchild, grandIdx) => {
                const grandActive = isActive(grandchild.url)
                const grandCS = getCS(grandchild.color || item.color)
                return (
                  <SidebarMenuSubItem
                    key={grandchild.title}
                    style={{
                      animationDelay: open ? `${grandIdx * 30}ms` : "0ms",
                    }}
                    className={cn(open && "animate-fade-in-up")}
                  >
                    <SidebarMenuSubButton asChild isActive={grandActive}>
                      <Link
                        href={grandchild.url || "#"}
                        className={cn(
                          "flex items-center gap-2 rounded-lg font-medium transition-all duration-150 group/menu-link group",
                          grandActive
                            ? cn(grandCS?.activeBg || "bg-primary/10", grandCS?.text || "text-primary font-medium", "shadow-sm")
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <ActiveBar cs={grandCS} active={grandActive} />
                        {grandchild.icon && (
                          <span className={cn(
                            "shrink-0 transition-all duration-150",
                            grandActive ? (grandCS?.text || "text-primary") : "text-muted-foreground"
                          )}>
                            {grandchild.icon}
                          </span>
                        )}
                        <span className="whitespace-normal leading-tight">{grandchild.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          )}
        </div>
      </div>
    </>
  )
}

const storedOpen: Record<string, boolean> = {}

function CollapsibleNavGroup({
  item,
  isActive,
  hasActiveChild,
}: {
  item: NavItem
  isActive: (url?: string) => boolean
  hasActiveChild: (item: NavItem) => boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const childActive = hasActiveChild(item)
  const [open, setOpen] = React.useState(() => storedOpen[item.title] ?? childActive)
  const cs = getCS(item.color)

  React.useEffect(() => {
    storedOpen[item.title] = open
  }, [open, item.title])

  const handleClick = (e: React.MouseEvent) => {
    setOpen((prev) => !prev)
    if (item.url && pathname !== item.url) {
      router.push(item.url)
    }
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={childActive}
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-2 text-[11px] font-medium transition-all duration-150 group/menu-link group",
          cs
            ? cn(cs.activeBg, "font-semibold tracking-wider text-[10px] uppercase", cs.text)
            : childActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <ActiveBar cs={cs} active={childActive} />
        <span className={cn(
          "shrink-0 transition-all duration-200 flex items-center justify-center rounded-xl",
          "group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:ring-1 group-data-[collapsible=icon]:ring-sidebar-border/0",
          cs
            ? cn(cs.activeBg, cs.text)
            : childActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-sidebar-accent"
        )}>
          {item.icon}
        </span>
        <span className={cn("flex-1 text-left text-[11px] font-semibold", cs?.text)}>{item.title}</span>
        <IconChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-all duration-200",
            cs ? "text-muted-foreground/40" : "text-muted-foreground",
            open && "rotate-180"
          )}
        />
      </SidebarMenuButton>
      <div
        className={cn(
          "grid transition-all duration-[var(--sidebar-transition-duration,300ms)] ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {item.children && (
            <SidebarMenuSub>
              {item.children.map((child, childIdx) => {
                const active = isActive(child.url)
                const childCS = getCS(child.color || item.color)
                if (child.children && child.children.length > 0) {
                  return (
                    <SidebarMenuSubItem
                      key={child.title}
                      style={{
                        animationDelay: open ? `${childIdx * 30}ms` : "0ms",
                      }}
                      className={cn(open && "animate-fade-in-up")}
                    >
                      <NestedCollapsibleGroup item={child} childActive={active || hasActiveChild(child)} childCS={childCS} isActive={isActive} />
                    </SidebarMenuSubItem>
                  )
                }
                return (
                  <SidebarMenuSubItem
                    key={child.title}
                    style={{
                      animationDelay: open ? `${childIdx * 30}ms` : "0ms",
                    }}
                    className={cn(
                      open && "animate-fade-in-up"
                    )}
                  >
                    <SidebarMenuSubButton asChild isActive={active}>
                      <Link
                        href={child.url || "#"}
                        className={cn(
                          "flex items-center gap-2 rounded-lg font-medium transition-all duration-150 group/menu-link group",
                          active
                            ? cn(childCS?.activeBg || "bg-primary/10", childCS?.text || "text-primary font-medium", "shadow-sm")
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <ActiveBar cs={childCS} active={active} />
                        {child.icon && (
                          <span className={cn(
                            "shrink-0 transition-all duration-150",
                            active ? (childCS?.text || "text-primary") : "text-muted-foreground"
                          )}>
                            {child.icon}
                          </span>
                        )}
                        <span className="whitespace-normal leading-tight">{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          )}
        </div>
      </div>
    </SidebarMenuItem>
  )
}
