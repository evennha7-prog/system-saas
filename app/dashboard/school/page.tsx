"use client"

import { ProtectedRoute } from "@/lib/protected-route"
import * as React from "react"
import { SchoolTable } from "../super-admin/school-table"
import { useLanguage } from "@/hooks/use-language"

export default function SchoolPage() {
  const { t } = useLanguage()

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-3 lg:px-4">
                  <h1 className="text-2xl font-bold">{t("sidebar.schoolManagement")}</h1>
                  <p className="text-muted-foreground">Create, update, delete and view all schools</p>
                  <div className="mt-4">
                    <SchoolTable />
                  </div>
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
