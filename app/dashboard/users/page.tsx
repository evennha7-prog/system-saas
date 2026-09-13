"use client"

import { ProtectedRoute } from "@/lib/protected-route"
import * as React from "react"
import { AdminTable } from "./admin-table"
import { useLanguage } from "@/hooks/use-language"

export default function UsersPage() {
  const { t } = useLanguage()

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-3 lg:px-4">
                  <h1 className="text-2xl font-bold">{t("sidebar.userManagement")}</h1>
                  <p className="text-muted-foreground">Create School Admin, manage all users, reset passwords, activate/deactivate accounts</p>
                  <div className="mt-4">
                    <AdminTable readOnly />
                  </div>
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
