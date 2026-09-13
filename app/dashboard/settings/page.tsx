"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/lib/protected-route"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@teispace/next-themes"
import { AUTH_TOKEN_KEY, logout, updateUserProfile } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import {
  IconTools,
  IconMessage,
  IconBuildingSkyscraper,
  IconReport,
  IconChevronRight,
  IconBell,
  IconSun,
  IconMoon,
  IconHelpCircle,
  IconMessage as IconMessage2,
  IconFileDescription,
  IconShield,
  IconLogout,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { toast } from "sonner"

const colorToOKLCH: Record<string, string> = {
  "#3b82f6": "oklch(0.527 0.154 150.069)",
  "#10b981": "oklch(0.545 0.179 162.275)",
  "#f59e0b": "oklch(0.75 0.150 45.605)",
  "#ef4444": "oklch(0.577 0.245 27.325)",
  "#8b5cf6": "oklch(0.608 0.249 291.276)",
  "#0d5ea6": "oklch(0.55 0.18 210)",
  "#ea4dc7": "oklch(0.65 0.22 320)",
  "#64dc78": "oklch(0.65 0.18 150)",
  "#a3ba16": "oklch(0.65 0.18 80)",
  "#d28": "oklch(0.55 0.18 340)",
}

const tGlobal = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}

export default function SettingsPage() {
  const { language } = useLanguage()
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notifications") !== "false"
    }
    return true
  })
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
  const [showEmailAlert, setShowEmailAlert] = React.useState(false)

  const [profileForm, setProfileForm] = React.useState({
    username: "",
    email: "",
  })
  const [isSavingProfile, setIsSavingProfile] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        email: user.email || "",
      })
    }
  }, [user])

  React.useEffect(() => {
    localStorage.setItem("notifications", String(notificationsEnabled))
  }, [notificationsEnabled])

  const [primaryColor, setPrimaryColor] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("primaryColor") || "#3b82f6"
    }
    return "#3b82f6"
  })

  React.useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor")
    if (savedColor) {
      const oklchColor = colorToOKLCH[savedColor] || savedColor
      document.documentElement.style.setProperty("--primary", oklchColor)
      document.documentElement.style.setProperty("--accent", oklchColor)
      document.documentElement.style.setProperty("--ring", oklchColor)
    }
  }, [])

  const handleColorChange = (color: string) => {
    setPrimaryColor(color)
    const oklchColor = colorToOKLCH[color] || color
    document.documentElement.style.setProperty("--primary", oklchColor)
    document.documentElement.style.setProperty("--accent", oklchColor)
    document.documentElement.style.setProperty("--ring", oklchColor)
    localStorage.setItem("primaryColor", color)
  }

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) throw new Error("Not authenticated")
      await updateUserProfile(token, user!.id, {
        username: profileForm.username,
        email: profileForm.email,
      })
      toast.success(tGlobal("notification.saved", language))
      await refreshUser()
      setIsEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tGlobal("notification.error", language))
    } finally {
      setIsSavingProfile(false)
    }
  }
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) {
        await logout(token)
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      router.push("/login")
    }
  }

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-3 lg:px-4">
            <h1 className="text-2xl font-bold">{tGlobal("sidebar.settings", language)}</h1>
            <p className="text-muted-foreground">{tGlobal("setting.customize", language)}</p>

            <div className="mt-6 grid gap-4">

              <Card>
                <CardHeader>
                  <CardTitle>{tGlobal("setting.account", language)}</CardTitle>
                  <CardDescription>{tGlobal("setting.accountDesc", language)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">{tGlobal("setting.joinInAccount", language)}</h4>
                      {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          Edit
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md bg-muted/30 p-2">
                        <div className="space-y-0.5">
                          <Label className="text-xs text-muted-foreground">{tGlobal("setting.userName", language)}</Label>
                          {isEditing ? (
                            <Input
                              id="profile-username"
                              value={profileForm.username}
                              onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                              className="mt-1 h-8 text-sm"
                            />
                          ) : (
                            <p className="text-sm font-medium">{profileForm.username}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/30 p-2">
                        <div className="space-y-0.5">
                          <Label className="text-xs text-muted-foreground">{tGlobal("setting.email", language)}</Label>
                          <p
                            className="text-sm font-medium"
                            onClick={() => isEditing && setShowEmailAlert(true)}
                          >{profileForm.email}</p>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex justify-end gap-2 pt-1">
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile} disabled={isSavingProfile} size="sm">
                            {isSavingProfile ? tGlobal("setting.saving", language) : "Save Changes"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>


                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconBell className="size-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tGlobal("setting.notifications", language)}</p>
                        <p className="text-sm text-muted-foreground">{tGlobal("setting.notificationsDesc", language)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{notificationsEnabled ? tGlobal("setting.notificationsOn", language) : tGlobal("setting.notificationsOff", language)}</span>
                      <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isDark ? <IconSun className="size-5 text-muted-foreground" /> : <IconMoon className="size-5 text-muted-foreground" />}
                      <div>
                        <p className="font-medium">{tGlobal("setting.darkMode", language)}</p>
                        <p className="text-sm text-muted-foreground">{tGlobal("setting.darkModeDesc", language)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                    >
                      {isDark ? tGlobal("setting.lightTheme", language) : tGlobal("setting.darkTheme", language)}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{tGlobal("setting.other", language)}</CardTitle>
                  <CardDescription>{tGlobal("setting.otherDesc", language)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <button onClick={() => router.push("/dashboard/help")} className="w-full flex items-center gap-3 text-left hover:bg-muted/50 p-2 rounded-md transition-colors -mx-2">
                    <IconHelpCircle className="size-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">{tGlobal("setting.helpSupport", language)}</p>
                      <p className="text-sm text-muted-foreground">{tGlobal("setting.helpSupportDesc", language)}</p>
                    </div>
                  </button>
                  <button onClick={() => router.push("/dashboard/feedback")} className="w-full flex items-center gap-3 text-left hover:bg-muted/50 p-2 rounded-md transition-colors -mx-2">
                    <IconMessage2 className="size-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">{tGlobal("setting.feedback", language)}</p>
                      <p className="text-sm text-muted-foreground">{tGlobal("setting.feedbackDesc", language)}</p>
                    </div>
                  </button>
                  <button onClick={() => router.push("/dashboard/terms")} className="w-full flex items-center gap-3 text-left hover:bg-muted/50 p-2 rounded-md transition-colors -mx-2">
                    <IconFileDescription className="size-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">{tGlobal("setting.terms", language)}</p>
                      <p className="text-sm text-muted-foreground">{tGlobal("setting.termsDesc", language)}</p>
                    </div>
                  </button>
                  <button onClick={() => router.push("/dashboard/privacy")} className="w-full flex items-center gap-3 text-left hover:bg-muted/50 p-2 rounded-md transition-colors -mx-2">
                    <IconShield className="size-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">{tGlobal("setting.privacy", language)}</p>
                      <p className="text-sm text-muted-foreground">{tGlobal("setting.privacyDesc", language)}</p>
                    </div>
                  </button>
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setShowLogoutDialog(true)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                    >
                      <IconLogout className="size-5" />
                      <div className="text-left">
                        <p className="font-medium">{tGlobal("setting.logOut", language)}</p>
                        <p className="text-sm text-red-500/70">{tGlobal("setting.logOutDesc", language)}</p>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">{tGlobal("setting.appearance", language)}</h2>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{tGlobal("setting.customColor", language)}</CardTitle>
                  <CardDescription>{tGlobal("setting.customColorDesc", language)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>{tGlobal("setting.presetColors", language)}</Label>
                    <div className="grid grid-cols-5 gap-2">
                      <Button
                        variant={primaryColor === "#3b82f6" ? "default" : "outline"}
                        className="h-10 bg-blue-500 border-2"
                        onClick={() => handleColorChange("#3b82f6")}
                      />
                      <Button
                        variant={primaryColor === "#10b981" ? "default" : "outline"}
                        className="h-10 bg-green-500 border-2"
                        onClick={() => handleColorChange("#10b981")}
                      />
                      <Button
                        variant={primaryColor === "#f59e0b" ? "default" : "outline"}
                        className="h-10 bg-yellow-500 border-2"
                        onClick={() => handleColorChange("#f59e0b")}
                      />
                      <Button
                        variant={primaryColor === "#ef4444" ? "default" : "outline"}
                        className="h-10 bg-red-500 border-2"
                        onClick={() => handleColorChange("#ef4444")}
                      />
                      <Button
                        variant={primaryColor === "#8b5cf6" ? "default" : "outline"}
                        className="h-10 bg-purple-500 border-2"
                        onClick={() => handleColorChange("#8b5cf6")}
                      />
                      <Button
                        variant={primaryColor === "#0d5ea6" ? "default" : "outline"}
                        className="h-10 bg-[#0d5ea6] border-2"
                        onClick={() => handleColorChange("#0d5ea6")}
                      />
                      <Button
                        variant={primaryColor === "#ea4dc7" ? "default" : "outline"}
                        className="h-10 bg-[#ea4dc7] border-2"
                        onClick={() => handleColorChange("#ea4dc7")}
                      />
                      <Button
                        variant={primaryColor === "#64dc78" ? "default" : "outline"}
                        className="h-10 bg-[#64dc78] border-2"
                        onClick={() => handleColorChange("#64dc78")}
                      />
                      <Button
                        variant={primaryColor === "#a3ba16" ? "default" : "outline"}
                        className="h-10 bg-[#a3ba16] border-2"
                        onClick={() => handleColorChange("#a3ba16")}
                      />
                      <Button
                        variant={primaryColor === "#d28" ? "default" : "outline"}
                        className="h-10 bg-[#d28] border-2"
                        onClick={() => handleColorChange("#d28")}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>{tGlobal("setting.customColor", language)}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="h-10 w-20 p-1 cursor-pointer"
                        value={primaryColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                      />
                      <Input
                        placeholder="#000000"
                        value={primaryColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">{tGlobal("setting.modules", language)}</h2>

            <div className="grid gap-4">
              {[
                {
                  key: "toolManagement",
                  title: tGlobal("setting.toolManagement", language),
                  description: tGlobal("setting.toolManagementDesc", language),
                  icon: IconTools,
                  color: "text-blue-500",
                  bgColor: "bg-blue-50 dark:bg-blue-950/30",
                  href: "/dashboard/tool-management",
                },
                {
                  key: "messages",
                  title: tGlobal("setting.messages", language),
                  description: tGlobal("setting.messagesDesc", language),
                  icon: IconMessage,
                  color: "text-green-500",
                  bgColor: "bg-green-50 dark:bg-green-950/30",
                  href: "/dashboard/messages",
                },
                {
                  key: "reports",
                  title: tGlobal("setting.reports", language),
                  description: tGlobal("setting.reportsDesc", language),
                  icon: IconReport,
                  color: "text-red-500",
                  bgColor: "bg-red-50 dark:bg-red-950/30",
                  href: "/dashboard/reports",
                },
              ].map((section) => (
                <Link key={section.key} href={section.href}>
                  <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                    <CardContent className="flex items-center gap-4 p-4 md:p-6">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${section.bgColor}`}>
                        <section.icon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{section.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{section.description}</p>
                      </div>
                      <IconChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>{tGlobal("logOut.confirmTitle", language)}</AlertDialogTitle>
            <AlertDialogDescription>
              {tGlobal("logOut.redirectMessage", language)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)} variant="outline">{tGlobal("common.cancel", language)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} variant="destructive">{tGlobal("setting.logOut", language)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEmailAlert} onOpenChange={setShowEmailAlert}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-blue-500/10 text-blue-500">
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Email cannot be changed</AlertDialogTitle>
            <AlertDialogDescription>
              Email is your login identity and cannot be modified. If you need to change it, please contact the system administrator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!flex !justify-center sm:!justify-center group-data-[size=sm]/alert-dialog-content:!grid-cols-1">
            <AlertDialogAction onClick={() => setShowEmailAlert(false)} className="min-w-24">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  )
}
