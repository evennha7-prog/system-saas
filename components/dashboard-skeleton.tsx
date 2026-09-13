"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function DashboardSkeleton() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="none" className="hidden lg:flex border-e">
          <SidebarHeader>
            <div className="flex items-center gap-3 p-1.5">
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="h-5 w-28" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <div className="flex flex-col gap-1 px-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-xl" />
                ))}
              </div>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <div className="flex h-(--header-height) items-center gap-4 border-b px-3 lg:px-4">
            <Skeleton className="h-8 w-8 rounded-2xl lg:hidden" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-8 rounded-2xl ms-auto" />
          </div>
          <div className="flex-1 p-6 space-y-6">
            <div className="grid gap-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="py-6">
                  <div className="space-y-3 px-6">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </Card>
              ))}
            </div>
            <Card className="gap-0">
              <div className="border-b px-6 py-3 flex gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b px-6 py-3 flex gap-4 last:border-b-0">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                  ))}
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
