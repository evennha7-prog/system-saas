"use client"

import * as React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconSend, IconMessage } from "@tabler/icons-react"
import {
  AUTH_TOKEN_KEY,
  sendMessage,
  getMessageUsers,
  getSchools,
  type ApiMessageUser,
  type ApiSchool,
  type RecipientType,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

function getToken(): string {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) throw new Error("Not authenticated")
  return token
}

export function SendMessageForm({ onSent }: { onSent?: () => void }) {
  const { user } = useAuth()
  const isSuperAdmin = user?.user_type === "SUPER_ADMIN"

  const [recipientType, setRecipientType] = React.useState<RecipientType>("individual")
  const [selectedUserId, setSelectedUserId] = React.useState("")
  const [selectedSchoolId, setSelectedSchoolId] = React.useState("")
  const [messageTitle, setMessageTitle] = React.useState("")
  const [messageBody, setMessageBody] = React.useState("")
  const [sending, setSending] = React.useState(false)

  const [messageUsers, setMessageUsers] = React.useState<ApiMessageUser[]>([])
  const [schools, setSchools] = React.useState<ApiSchool[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        const token = getToken()
        if (isSuperAdmin) {
          const [usersRes, schoolsRes] = await Promise.all([
            getMessageUsers(token),
            getSchools(token),
          ])
          if (usersRes?.data) setMessageUsers(usersRes.data)
          if (schoolsRes?.data) setSchools(schoolsRes.data)
        } else {
          const usersRes = await getMessageUsers(token)
          if (usersRes?.data) setMessageUsers(usersRes.data)
        }
      } catch {
        // silent
      }
    }
    load()
  }, [isSuperAdmin])

  const resetForm = () => {
    setSelectedUserId("")
    setSelectedSchoolId("")
    setMessageTitle("")
    setMessageBody("")
  }

  const handleSend = async () => {
    if (!messageTitle || !messageBody) {
      toast.error("Please fill in title and message")
      return
    }

    try {
      setSending(true)
      const token = getToken()

      if (isSuperAdmin) {
        if (recipientType === "individual" && !selectedUserId) {
          toast.error("Please select a recipient")
          return
        }
        if (recipientType === "school" && !selectedSchoolId) {
          toast.error("Please select a school")
          return
        }
        const base = {
          recipient_type: recipientType,
          title: messageTitle,
          message: messageBody,
        }
        const payload = recipientType === "individual"
          ? { ...base, recipient_id: Number(selectedUserId) }
          : recipientType === "school"
            ? { ...base, school_id: Number(selectedSchoolId) }
            : base
        await sendMessage(token, payload)
      } else {
        if (!selectedUserId) {
          toast.error("Please select a recipient")
          return
        }
        await sendMessage(token, {
          recipient_type: "individual" as const,
          recipient_id: Number(selectedUserId),
          title: messageTitle,
          message: messageBody,
        })
      }

      toast.success("Message sent successfully!")
      resetForm()
      onSent?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconMessage className="h-5 w-5" />
          Send Message
        </CardTitle>
        <CardDescription>
          {isSuperAdmin
            ? "Compose and send a message to school administrators"
            : "Send a message to Super Admin"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSuperAdmin ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="recipientType">Send To</Label>
              <Select
                value={recipientType}
                onValueChange={(v: RecipientType) => {
                  setRecipientType(v)
                  setSelectedUserId("")
                  setSelectedSchoolId("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual School Admin</SelectItem>
                  <SelectItem value="school">Specific School</SelectItem>
                  <SelectItem value="all_schools">All Schools</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === "individual" && (
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a School Admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageUsers.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.username || u.email} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {recipientType === "school" && (
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a School" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.enname || s.khname || `School #${s.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {recipientType === "all_schools" && (
              <Alert variant="default">
                <AlertDescription>
                  This message will be sent to all active school administrators across all schools.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="recipient">Send To (Super Admin)</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Super Admin" />
              </SelectTrigger>
              <SelectContent>
                {messageUsers.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.username || u.email} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="msgTitle">Title</Label>
          <Input
            id="msgTitle"
            placeholder="e.g. Account Update"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="msgBody">Message</Label>
          <textarea
            id="msgBody"
            rows={4}
            placeholder="Type your message here..."
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <Button onClick={handleSend} disabled={sending} className="gap-2">
          <IconSend className="h-4 w-4" />
          {sending ? "Sending..." : "Send Message"}
        </Button>
      </CardContent>
    </Card>
  )
}