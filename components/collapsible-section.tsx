"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { IconChevronDown } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CollapsibleSectionProps {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  count?: number
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  count,
  children,
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isOpen = controlledOpen ?? internalOpen
  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(isOpen) : value
    if (onOpenChange) {
      onOpenChange(next)
    } else {
      setInternalOpen(next)
    }
  }

  return (
    <Card className="gap-0 overflow-hidden transition-all duration-300 hover:shadow-lg border-t-2 border-t-transparent">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-6 py-4 h-auto rounded-none transition-all duration-200",
          isOpen
            ? "border-b bg-gradient-to-r from-accent/20 via-accent/5 to-transparent"
            : "hover:bg-accent/30"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className={cn(
              "flex size-6 shrink-0 items-center justify-center transition-transform duration-200",
              isOpen && "scale-110"
            )}>
              {icon}
            </span>
          )}
          <span className={cn(
            "text-base font-medium transition-all duration-200",
            isOpen && "text-foreground"
          )}>
            {title}
          </span>
          {count != null && (
            <span className={cn(
              "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums transition-all duration-200",
              isOpen
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-primary/10 text-primary"
            )}>
              {count}
            </span>
          )}
        </div>
        <IconChevronDown
          className={cn(
            "h-5 w-5 shrink-0 transition-all duration-300 ease-out",
            isOpen
              ? "rotate-180 text-foreground"
              : "text-muted-foreground group-hover:text-foreground/60"
          )}
        />
      </Button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className={cn(
            "py-4 transition-all duration-300",
            isOpen ? "animate-fade-in-up" : ""
          )}>
            {children}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
