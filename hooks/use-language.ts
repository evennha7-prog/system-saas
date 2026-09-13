"use client"

import { useState, useEffect, useCallback } from "react"
import { translations, t as translate } from "@/lib/translations"

export type Language = "en" | "km" | "zh"

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("language")
    if (saved && ["en", "km", "zh"].includes(saved)) {
      setLanguage(saved as Language)
    }
  }, [])

  useEffect(() => {
    const handleChange = () => {
      const saved = localStorage.getItem("language")
      if (saved && ["en", "km", "zh"].includes(saved)) {
        setLanguage(saved as Language)
      }
    }

    window.addEventListener("languagechange", handleChange)
    return () => window.removeEventListener("languagechange", handleChange)
  }, [])

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
      window.dispatchEvent(new Event("languagechange"))
    }
  }, [])

  const t = useCallback(
    (key: string) => (mounted ? translate(key, language) : key),
    [language, mounted]
  )

  return { language, changeLanguage, t, mounted }
}
