"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { IconMessage, IconBrandTelegram } from "@tabler/icons-react"

const tGlobal = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}

export default function FeedbackPage() {
  const { language } = useLanguage()

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-3 lg:px-4">
            <div className="flex items-center gap-3 mb-6">
              <IconMessage className="size-8 text-primary" />
              <h1 className="text-2xl font-bold">{tGlobal("setting.feedback", language)}</h1>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    This section gives users a voice to share their thoughts, suggestions, and overall experiences directly with the development or product team.
                  </p>
                  
                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-semibold text-foreground">What it usually includes:</h3>
                    <p>
                      Bug reporting tools, feature request forms, rating scales, or open-ended text boxes.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-semibold text-foreground">Purpose:</h3>
                    <p>
                      To gather user insights, patch errors, and guide future updates or feature development.
                    </p>
                  </div>

                  <div className="space-y-2 mt-6 pt-4 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <IconMessage className="size-4" />
                      Direct Feedback
                    </h3>
                    <p>
                      You can also send your feedback directly to our team via Telegram:
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
