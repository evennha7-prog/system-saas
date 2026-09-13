"use client"

import * as React from "react"
import { IconUsers, IconBuilding, IconBook, IconChartBar, IconClipboardList } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SectionCardsProps {
  studentCount?: number
  teacherCount?: number
  branchCount?: number
  levelCount?: number
  reportCount?: number
  isLoading?: boolean
}

const cardConfig = [
  { label: "Total Students", icon: IconUsers, color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500/10 to-blue-500/5", border: "hover:border-blue-500/30" },
  { label: "Total Teachers", icon: IconBook, color: "text-amber-500", bg: "bg-amber-500/10", gradient: "from-amber-500/10 to-amber-500/5", border: "hover:border-amber-500/30" },
  { label: "Branches", icon: IconBuilding, color: "text-green-500", bg: "bg-green-500/10", gradient: "from-green-500/10 to-green-500/5", border: "hover:border-green-500/30" },
  { label: "Levels", icon: IconChartBar, color: "text-purple-500", bg: "bg-purple-500/10", gradient: "from-purple-500/10 to-purple-500/5", border: "hover:border-purple-500/30" },
  { label: "Reports", icon: IconClipboardList, color: "text-red-500", bg: "bg-red-500/10", gradient: "from-red-500/10 to-red-500/5", border: "hover:border-red-500/30" },
]

function AnimatedCount({ value, isVisible }: { value: number; isVisible: boolean }) {
  const [displayed, setDisplayed] = React.useState(0)
  const [hasAnimated, setHasAnimated] = React.useState(false)

  React.useEffect(() => {
    if (!isVisible || hasAnimated) return
    setHasAnimated(true)
    const duration = 600
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayed(value)
        clearInterval(timer)
      } else {
        setDisplayed(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, isVisible, hasAnimated])

  React.useEffect(() => {
    setHasAnimated(false)
  }, [value])

  return <>{hasAnimated ? displayed : value}</>
}

export function SectionCards({
  studentCount,
  teacherCount,
  branchCount,
  levelCount,
  reportCount,
  isLoading,
}: SectionCardsProps) {
  const counts = [studentCount, teacherCount, branchCount, levelCount, reportCount]
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="grid gap-4 px-3 lg:px-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-5">
      {cardConfig.map((card, i) => (
        <div
          key={card.label}
          className={cn(
            "animate-fade-in-up",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
        >
          <Card
            className={cn(
              "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border",
              card.border,
              "bg-gradient-to-br from-card to-card/95"
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
              card.gradient
            )} />
            <CardHeader className="flex flex-row items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <CardDescription className="text-xs font-medium tracking-wide uppercase">
                  {card.label}
                </CardDescription>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <CardTitle className="text-2xl font-bold tabular-nums">
                    {counts[i] != null ? (
                      <AnimatedCount value={counts[i]} isVisible={visible} />
                    ) : "--"}
                  </CardTitle>
                )}
              </div>
              <div className={cn(
                "flex size-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
                card.bg
              )}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
            </CardHeader>
          </Card>
        </div>
      ))}
    </div>
  )
}
