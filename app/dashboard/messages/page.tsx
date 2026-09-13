"use client"

import * as React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SendMessageForm } from "@/app/dashboard/super-admin/send-message-form"
import { SentMessages } from "@/app/dashboard/super-admin/sent-messages"
export default function MessagesPage() {
  const [msgTabKey, setMsgTabKey] = React.useState("compose")
  const [msgRefreshKey, setMsgRefreshKey] = React.useState(0)

  return (
    <ProtectedRoute allowedUserTypes={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
            <div className="@container/main flex flex-1 flex-col gap-2" suppressHydrationWarning>
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-3 lg:px-4">
                  <h1 className="text-2xl font-bold">Messages</h1>
                  <p className="text-muted-foreground">Compose and manage system-wide messages to school administrators</p>
                  <div className="mt-6">
                    <Tabs value={msgTabKey} onValueChange={setMsgTabKey}>
                      <TabsList>
                        <TabsTrigger value="compose">Compose</TabsTrigger>
                        <TabsTrigger value="sent">Sent Messages</TabsTrigger>
                      </TabsList>
                      <TabsContent value="compose" className="mt-4">
                        <SendMessageForm
                          onSent={() => {
                            setMsgRefreshKey((k) => k + 1)
                            setMsgTabKey("sent")
                          }}
                        />
                      </TabsContent>
                      <TabsContent value="sent" className="mt-4">
                        <SentMessages key={msgRefreshKey} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
    </ProtectedRoute>
  )
}
