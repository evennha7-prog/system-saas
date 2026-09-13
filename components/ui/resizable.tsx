"use client"

import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  const isMobile = useIsMobile()
  const [isDragging, setIsDragging] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  if (isMobile) return null

  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      data-dragging={isDragging || undefined}
      className={cn(
        "relative flex w-1 items-center justify-center outline-hidden select-none",
        "group/handle cursor-col-resize",
        "before:absolute before:inset-y-0 before:start-1/2 before:w-[4px] before:-translate-x-1/2",
        "before:transition-colors before:duration-200",
        "hover:before:bg-border/80",
        "data-dragging:before:bg-border",
        "aria-[orientation=horizontal]:h-4 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize aria-[orientation=horizontal]:before:h-[4px] aria-[orientation=horizontal]:before:w-full aria-[orientation=horizontal]:before:translate-x-0 aria-[orientation=horizontal]:before:-translate-y-1/2",
        className
      )}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "z-10 flex h-10 w-[3px] shrink-0 items-center justify-center rounded-full transition-all duration-200",
            isDragging
              ? "h-12 w-[5px] bg-foreground/20"
              : isHovered
                ? "h-12 w-[5px] bg-foreground/15"
                : "bg-border/60"
          )}
        >
          <div
            className={cn(
              "h-6 w-[1.5px] rounded-full transition-all duration-200",
              isDragging
                ? "h-8 bg-foreground/30"
                : isHovered
                  ? "h-8 bg-foreground/20"
                  : "bg-border"
            )}
          />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
export type PanelSize = ResizablePrimitive.PanelSize
