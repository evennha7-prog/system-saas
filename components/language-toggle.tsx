"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const languages = [
  { code: "en", label: "English", flag: "/resources/icons/uk.png" },
  { code: "km", label: "Khmer", flag: "/resources/icons/kh.png" },
  { code: "zh", label: "Chinese", flag: "/resources/icons/zh.png" },
]

export function LanguageToggle() {
  const [language, setLanguage] = React.useState("en")

  React.useEffect(() => {
    const saved = localStorage.getItem("language")
    if (saved && languages.some(l => l.code === saved)) {
      setLanguage(saved)
    }
  }, [])

  const toggleLanguage = () => {
    const currentIndex = languages.findIndex((lang) => lang.code === language)
    const nextIndex = (currentIndex + 1) % languages.length
    const newLang = languages[nextIndex].code
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
    document.documentElement.lang = newLang
    window.dispatchEvent(new Event("languagechange"))
  }

  const currentLang = languages.find((lang) => lang.code === language)

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative"
      onClick={toggleLanguage}
      title={currentLang?.label}
    >
      <Image
        src={currentLang!.flag}
        alt={currentLang!.label}
        width={24}
        height={16}
        className="h-4 w-6 rounded object-cover"
      />
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}

export function useLanguage() {
  const [language, setLanguage] = React.useState("en")

  React.useEffect(() => {
    const saved = localStorage.getItem("language")
    if (saved && ["en", "km", "zh"].includes(saved)) {
      setLanguage(saved)
    }

    const handleChange = () => {
      const saved = localStorage.getItem("language")
      if (saved && ["en", "km", "zh"].includes(saved)) {
        setLanguage(saved)
      }
    }

    window.addEventListener("languagechange", handleChange)
    return () => window.removeEventListener("languagechange", handleChange)
  }, [])

  return language
}