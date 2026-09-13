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

export default function CustomUIPage() {
  const { t } = useLanguage()

  const [primaryColor, setPrimaryColor] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("primaryColor") || "#3b82f6"
    }
    return "#3b82f6"
  })

  const [fontSize, setFontSize] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fontSize") || "medium"
    }
    return "medium"
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

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    const sizeMap: Record<string, string> = {
      small: "14px",
      medium: "16px",
      large: "18px",
    }
    document.documentElement.style.setProperty("font-size", sizeMap[size] || "16px")
    localStorage.setItem("fontSize", size)
  }

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
                <h1 className="text-2xl font-bold">{t("sidebar.customUI")}</h1>
                <p className="text-muted-foreground">Customize your theme colors</p>
              </div>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Color</CardTitle>
                  <CardDescription>Choose your preferred primary color</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Preset Colors</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
                        "#0d5ea6", "#ea4dc7", "#64dc78", "#a3ba16", "#d28",
                      ].map((color) => (
                        <Button
                          key={color}
                          variant={primaryColor === color ? "default" : "outline"}
                          className={`h-10 border-2`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                        />
                      ))}
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Font Size</CardTitle>
                  <CardDescription>Adjust the font size to your preference</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant={fontSize === "small" ? "default" : "outline"}
                      onClick={() => handleFontSizeChange("small")}
                    >
                      Small
                    </Button>
                    <Button
                      variant={fontSize === "medium" ? "default" : "outline"}
                      onClick={() => handleFontSizeChange("medium")}
                    >
                      Medium
                    </Button>
                    <Button
                      variant={fontSize === "large" ? "default" : "outline"}
                      onClick={() => handleFontSizeChange("large")}
                    >
                      Large
                    </Button>
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
