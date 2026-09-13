"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { IconShield } from "@tabler/icons-react"

const tGlobal = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}

export default function PrivacyPolicyPage() {
  const { language } = useLanguage()

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-3 lg:px-4">
            <div className="flex items-center gap-3 mb-6">
              <IconShield className="size-8 text-primary" />
              <h1 className="text-2xl font-bold">{tGlobal("setting.privacyPolicy", language)}</h1>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    This is a legally required document that explains exactly how the platform collects, uses, stores, and protects a user's personal data.
                  </p>
                  
                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-semibold text-foreground">What it usually includes:</h3>
                    <p>
                      Details on what data is collected (e.g., email, location, cookies), how that data is utilized, whether it is shared with third parties, and how users can request their data to be deleted.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-semibold text-foreground">Purpose:</h3>
                    <p>
                      To ensure compliance with global data protection laws (like GDPR or CCPA) and build trust with users regarding their personal information.
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
