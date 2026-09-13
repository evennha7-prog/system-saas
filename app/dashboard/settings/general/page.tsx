"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { IconArrowLeft } from "@tabler/icons-react"

export default function GeneralSettingsPage() {
  const { t } = useLanguage()

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-3 lg:px-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard/settings" className="text-muted-foreground hover:text-foreground transition-colors">
                      <IconArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                      <h1 className="text-2xl font-bold">{t("sidebar.systemSettings")}</h1>
                      <p className="text-muted-foreground">Configure global settings, manage roles & permissions, enable/disable features</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure app name, logo, and timezone</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="appName">App Name</Label>
                          <Input id="appName" defaultValue="NK ONE School" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Input id="timezone" defaultValue="Asia/Phnom_Penh" />
                        </div>
                        <Button>Save Changes</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Features</CardTitle>
                        <CardDescription>Enable or disable system features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="multiSchool">Multi-School</Label>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="reports">Reports</Label>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notifications">Notifications</Label>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Roles & Permissions</CardTitle>
                        <CardDescription>Manage user roles and access permissions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Role management coming soon...</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Password policies and security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="2fa">Two-Factor Authentication</Label>
                          <Button variant="outline" size="sm">Disabled</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="passwordReset">Password Reset</Label>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
