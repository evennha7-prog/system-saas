"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { IconChevronDown } from "@tabler/icons-react"
import { useIsMobile } from "@/hooks/use-mobile"

type NavItem = {
  title: string
  url?: string
  icon?: React.ReactNode
  color?: string
  children?: NavItem[]
}

interface SidebarSectionsProps {
  items: NavItem[]
}

function ResizeHandle({ onDrag }: { onDrag: (deltaY: number) => void }) {
  const handleRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const startY = React.useRef(0)

  React.useEffect(() => {
    const el = handleRef.current
    if (!el) return

    const onMouseDown = (e: MouseEvent) => {
      dragging.current = true
      startY.current = e.clientY
      document.body.style.cursor = "row-resize"
      document.body.style.userSelect = "none"
      e.preventDefault()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const delta = e.clientY - startY.current
      startY.current = e.clientY
      onDrag(delta)
    }

    const onMouseUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    el.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    return () => {
      el.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [onDrag])

  return (
    <div
      ref={handleRef}
      className="group/handle relative shrink-0 h-2 cursor-row-resize flex items-center justify-center hover:bg-accent/30 transition-colors"
    >
      <div className="w-8 h-[2px] rounded-full bg-border/40 group-hover/handle:bg-border/80 group-hover/handle:h-[3px] transition-all" />
    </div>
  )
}

export function SidebarSections({ items }: SidebarSectionsProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const flexValuesRef = React.useRef<number[]>(items.map(() => 1))
  const [, forceRender] = React.useState(0)

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({})

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

  React.useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev }
      items.forEach((item) => {
        if (item.children && hasActiveChild(item) && !next[item.title]) {
          next[item.title] = true
        }
        if (!(item.title in next) && item.children) {
          next[item.title] = hasActiveChild(item)
        }
      })
      return next
    })
  }, [items, hasActiveChild])

  const handleDrag = React.useCallback(
    (index: number) => (deltaY: number) => {
      const container = containerRef.current
      if (!container) return
      const containerHeight = container.clientHeight
      if (containerHeight <= 0) return

      const totalFlex = flexValuesRef.current.reduce((a, b) => a + b, 0)
      const flexPerPx = totalFlex / containerHeight
      const flexDelta = deltaY * flexPerPx

      const a = flexValuesRef.current[index]
      const b = flexValuesRef.current[index + 1]
      if (!b) return

      let newA = Math.max(0.3, a + flexDelta)
      let newB = Math.max(0.3, b - flexDelta)
      const sum = a + b
      if (newA + newB > sum) {
        const overflow = newA + newB - sum
        newA -= overflow / 2
        newB -= overflow / 2
      }
      newA = Math.max(0.3, newA)
      newB = Math.max(0.3, newB)

      flexValuesRef.current[index] = Math.round(newA * 10) / 10
      flexValuesRef.current[index + 1] = Math.round(newB * 10) / 10
      forceRender((n) => n + 1)
    },
    []
  )

  if (isMobile) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              if (item.children && item.children.length > 0) {
                return (
                  <CollapsibleNavGroup
                    key={item.title}
                    item={item}
                    isActive={isActive}
                    hasActiveChild={hasActiveChild}
                    pathname={pathname}
                  />
                )
              }
              const active = isActive(item.url)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
                    <Link
                      href={item.url || "#"}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
                        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <div ref={containerRef} className="flex flex-1 flex-col overflow-hidden">
      {items.map((item, index) => {
        const hasChildren = item.children && item.children.length > 0
        const childActive = hasChildren ? hasActiveChild(item) : isActive(item.url)
        const flex = flexValuesRef.current[index] ?? 1

        if (!hasChildren) {
          return (
            <React.Fragment key={item.title}>
              <div
                className="flex shrink-0 items-center"
                style={{ flex: `${flex} 1 0` }}
              >
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={childActive}
                >
                  <Link
                    href={item.url || "#"}
                    className="flex items-center gap-3 group"
                  >
                    <span className={cn("shrink-0", childActive ? "text-primary" : "text-muted-foreground")}>
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </div>
              {index < items.length - 1 && (
                <ResizeHandle onDrag={handleDrag(index)} />
              )}
            </React.Fragment>
          )
        }

        const isOpen = openSections[item.title] ?? childActive

        return (
          <React.Fragment key={item.title}>
            <SidebarGroup
              className="flex flex-col overflow-hidden min-h-0"
              style={{ flex: `${flex} 1 0` }}
            >
              <SidebarGroupLabel
                asChild
                className="cursor-pointer select-none rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenSections((prev) => ({
                      ...prev,
                      [item.title]: !prev[item.title],
                    }))
                  }
                  className="flex w-full items-center gap-3 group"
                >
                  <span className={cn("shrink-0", childActive ? "text-primary" : "text-muted-foreground")}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left text-sm">{item.title}</span>
                  <IconChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              </SidebarGroupLabel>
              {isOpen && (
                <SidebarGroupContent className="overflow-auto">
                  <SidebarMenuSub>
                    {item.children!.map((child) => {
                      const active = isActive(child.url)
                      return (
                        <SidebarMenuSubItem key={child.title}>
                          <SidebarMenuSubButton asChild isActive={active}>
                            <Link
                              href={child.url || "#"}
                              className={cn(
                                "flex items-center gap-3 w-full group",
                                active && "bg-primary/10 text-primary font-medium"
                              )}
                            >
                              {child.icon && (
                                <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>
                                  {child.icon}
                                </span>
                              )}
                              <span>{child.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            {index < items.length - 1 && (
              <ResizeHandle onDrag={handleDrag(index)} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function CollapsibleNavGroup({
  item,
  isActive,
  hasActiveChild,
  pathname,
}: {
  item: NavItem
  isActive: (url?: string) => boolean
  hasActiveChild: (item: NavItem) => boolean
  pathname: string
}) {
  const childActive = hasActiveChild(item)
  const [open, setOpen] = React.useState(childActive)

  React.useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={childActive}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3"
      >
        <span className={cn("shrink-0", childActive ? "text-primary" : "text-muted-foreground")}>
          {item.icon}
        </span>
        <span className="flex-1 text-left">{item.title}</span>
        <IconChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </SidebarMenuButton>
      {open && item.children && (
        <SidebarMenuSub>
          {item.children.map((child) => {
            const active = isActive(child.url)
            return (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton asChild isActive={active}>
                  <Link
                    href={child.url || "#"}
                    className={cn(
                      "flex items-center gap-3 w-full group",
                      active && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {child.icon && (
                      <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>
                        {child.icon}
                      </span>
                    )}
                    <span>{child.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}
