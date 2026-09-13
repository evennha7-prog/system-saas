"use client"

import { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/lib/protected-route"

interface DashboardLayoutProps {
  children: ReactNode
  allowedUserTypes?: ("SUPER_ADMIN" | "SCHOOL_ADMIN")[]
}

export function DashboardLayout({
  children,
  allowedUserTypes,
}: DashboardLayoutProps) {
  return (
    <ProtectedRoute allowedUserTypes={allowedUserTypes}>
      <SidebarProvider
        defaultOpen={true}
        style={
          {
            "--sidebar-width": "240px",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" collapsible="offcanvas" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col" suppressHydrationWarning>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
