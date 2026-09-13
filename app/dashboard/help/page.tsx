"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { IconHelpCircle, IconBrandTelegram } from "@tabler/icons-react"

const tGlobal = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}

export default function HelpSupportPage() {
  const { language } = useLanguage()

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-3 lg:px-4">
            <div className="flex items-center gap-3 mb-6">
              <IconHelpCircle className="size-8 text-primary" />
              <h1 className="text-2xl font-bold">{tGlobal("setting.helpSupport", language)}</h1>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    This is the go-to resource hub for users who need assistance, encounter technical issues, or have questions about using the platform.
                  </p>
                  
                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-semibold text-foreground">What it usually includes:</h3>
                    <p>
                      Frequently Asked Questions (FAQs), troubleshooting guides, step-by-step tutorials, live chat options, or a contact form to reach a customer service representative.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-semibold text-foreground">Purpose:</h3>
                    <p>
                      To resolve user issues quickly and improve user satisfaction.
                    </p>
                  </div>

                  <div className="space-y-2 mt-6 pt-4 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <IconHelpCircle className="size-4" />
                      Contact Us
                    </h3>
                    <p>
                      Need immediate assistance? Reach out to us directly on Telegram:
                      <br />
                      <a href="https://t.me/nha_official" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 hover:underline font-medium inline-flex items-center gap-1 mt-1">
                        <IconBrandTelegram className="size-5" /> Telegram
                      </a>
                    </p>
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
