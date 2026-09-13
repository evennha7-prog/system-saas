"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/lib/auth-context"
import { updateUser, getSchools, updateSchoolProfile, AUTH_TOKEN_KEY } from "@/lib/api"
import { toast } from "sonner"

export default function SchoolAdminSettingsPage() {
  const { language, changeLanguage, t } = useLanguage()
  const { user } = useAuth()
  const [theme, setTheme] = React.useState("light")
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6")
  const [fontSize, setFontSize] = React.useState("medium")
  const [schoolName, setSchoolName] = React.useState("")
  const [schoolKhName, setSchoolKhName] = React.useState("")
  const [schoolZhName, setSchoolZhName] = React.useState("")
  const [schoolEmail, setSchoolEmail] = React.useState("")
  const [schoolPhone, setSchoolPhone] = React.useState("")
  const [schoolAddress, setSchoolAddress] = React.useState("")
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoadingSchool, setIsLoadingSchool] = React.useState(true)

  React.useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor")
    if (savedColor) {
      setPrimaryColor(savedColor)
      applyColor(savedColor)
    }
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
    }
    const savedFont = localStorage.getItem("fontSize")
    if (savedFont) {
      setFontSize(savedFont)
    }
    loadSchoolInfo()
  }, [])

  const loadSchoolInfo = async () => {
    try {
      setIsLoadingSchool(true)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) return
      const res = await getSchools(token)
      if (res?.data && res.data.length > 0) {
        const school = res.data[0]
        setSchoolName(school.enname || school.khname || "")
        setSchoolKhName(school.khname || "")
        setSchoolZhName(school.zhname || "")
      }
    } catch {
      // silent
    } finally {
      setIsLoadingSchool(false)
    }
  }

  const applyColor = (color: string) => {
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
    const oklchColor = colorToOKLCH[color] || color
    document.documentElement.style.setProperty("--primary", oklchColor)
    document.documentElement.style.setProperty("--accent", oklchColor)
    document.documentElement.style.setProperty("--ring", oklchColor)
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const handleColorChange = (color: string) => {
    setPrimaryColor(color)
    applyColor(color)
    localStorage.setItem("primaryColor", color)
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    localStorage.setItem("fontSize", size)
    const sizeMap: Record<string, string> = { small: "14px", medium: "16px", large: "18px" }
    document.documentElement.style.setProperty("font-size", sizeMap[size] || "16px")
  }

  const handleSaveSchoolInfo = async () => {
    if (!schoolName.trim()) {
      toast.error("School name is required")
      return
    }
    setIsSaving(true)
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!token) throw new Error("Not authenticated")
      await updateSchoolProfile(token, {
        enname: schoolName,
        khname: schoolKhName,
        zhname: schoolZhName,
      })
      toast.success("School information saved successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save school information")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token || !user?.id) return

      await updateUser(token, user.id, { password: newPassword })
      alert("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error changing password:", error)
      alert("Failed to change password")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedUserTypes={["SCHOOL_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-3 lg:px-4">
                  <h1 className="text-2xl font-bold">{t("sidebar.settings")}</h1>
                  <p className="text-muted-foreground">Manage your school settings and preferences</p>

                  <div className="mt-6 grid gap-4">


                    <Card>
                      <CardHeader>
                        <CardTitle>School Information</CardTitle>
                        <CardDescription>Update your school name and details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isLoadingSchool ? (
                          <p className="text-sm text-muted-foreground">Loading school info...</p>
                        ) : (
                          <>
                            <div className="grid gap-2">
                              <Label htmlFor="schoolName">School Name (English)</Label>
                              <Input id="schoolName" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="schoolKhName">School Name (Khmer)</Label>
                              <Input id="schoolKhName" value={schoolKhName} onChange={(e) => setSchoolKhName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="schoolZhName">School Name (Chinese)</Label>
                              <Input id="schoolZhName" value={schoolZhName} onChange={(e) => setSchoolZhName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="schoolEmail">Email</Label>
                              <Input id="schoolEmail" type="email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} disabled />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="schoolPhone">Phone</Label>
                              <Input id="schoolPhone" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} disabled />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="schoolAddress">Address</Label>
                              <Input id="schoolAddress" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} disabled />
                            </div>
                            <Button onClick={handleSaveSchoolInfo} disabled={isSaving || isLoadingSchool}>
                              {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Theme Setup</CardTitle>
                        <CardDescription>Customize color and font</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <Label>Preset Colors</Label>
                          <div className="grid grid-cols-5 gap-2">
                            {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0d5ea6", "#ea4dc7", "#64dc78", "#a3ba16", "#d28"].map(
                              (color) => (
                                <Button
                                  key={color}
                                  variant={primaryColor === color ? "default" : "outline"}
                                  className="h-10 border-2"
                                  style={{ backgroundColor: color }}
                                  onClick={() => handleColorChange(color)}
                                />
                              )
                            )}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Custom Color</Label>
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
                        <div className="grid gap-2">
                          <Label>Font Size</Label>
                          <div className="flex gap-2">
                            {["small", "medium", "large"].map((size) => (
                              <Button
                                key={size}
                                variant={fontSize === size ? "default" : "outline"}
                                onClick={() => handleFontSizeChange(size)}
                              >
                                {size.charAt(0).toUpperCase() + size.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <Button onClick={() => handleFontSizeChange(fontSize)}>Save Theme</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleChangePassword} disabled={isSaving}>
                          {isSaving ? "Updating..." : "Update Password"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
