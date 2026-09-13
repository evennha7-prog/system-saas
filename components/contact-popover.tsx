"use client"

import * as React from "react"
import { IconUser } from "@tabler/icons-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { translations } from "@/lib/translations"

function useLanguage() {
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

const t = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}

export function ContactPopover() {
  const language = useLanguage()
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <IconUser className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t("contact.title", language)}</h3>
          <p className="text-sm text-muted-foreground">
            {t("contact.description", language)}
          </p>
          <a
            href="https://t.me/nha_officail"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2"
          >
            <Button variant="outline" className="w-full gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM16.59 7.58L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
              </svg>
              {t("contact.telegram", language)}
            </Button>
          </a>
        </div>
      </PopoverContent>
    </Popover>
  )
}
