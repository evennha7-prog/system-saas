"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { IconFileDescription } from "@tabler/icons-react"

const tGlobal = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}

export default function TermsPage() {
  const { language } = useLanguage()

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-3 lg:px-4">
            <div className="flex items-center gap-3 mb-6">
              <IconFileDescription className="size-8 text-primary" />
              <h1 className="text-2xl font-bold">{tGlobal("setting.terms", language)}</h1>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    This is a legally binding contract between the platform and the user that outlines the rules, guidelines, and expectations for using the service.
                  </p>
                  
                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-semibold text-foreground">What it usually includes:</h3>
                    <p>
                      User conduct rules, intellectual property rights, account termination clauses, payment/subscription terms, and liability limitations.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-semibold text-foreground">Purpose:</h3>
                    <p>
                      To protect the business legally and set clear boundaries for acceptable use of the platform.
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
