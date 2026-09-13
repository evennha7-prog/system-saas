"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "@teispace/next-themes"

const colorToOKLCH: Record<string, string> = {
  "#3b82f6": "oklch(0.527 0.154 150.069)",
  "#10b981": "oklch(0.545 0.179 162.275)",
  "#f59e0b": "oklch(0.75 0.150 45.605)",
  "#ef4444": "oklch(0.577 0.245 27.325)",
  "#8b5cf6": "oklch(0.608 0.249 291.276)",
}

function applyPrimaryColor(color: string) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  const oklchColor = colorToOKLCH[color] || color
  root.style.setProperty("--primary", oklchColor)
  root.style.setProperty("--accent", oklchColor)
  root.style.setProperty("--ring", oklchColor)
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor")
    if (savedColor) {
      applyPrimaryColor(savedColor)
    }
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}