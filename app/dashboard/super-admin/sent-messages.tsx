"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { IconTrash, IconRefresh, IconAlertTriangle, IconEye } from "@tabler/icons-react"
import { AUTH_TOKEN_KEY, getSentMessages, deleteSentMessage, type ApiSentMessage } from "@/lib/api"
import { toast } from "sonner"

function getToken(): string {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) throw new Error("Not authenticated")
  return token
}

const recipientTypeBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  individual: { label: "Individual", variant: "default" },
  all_schools: { label: "All Schools", variant: "secondary" },
  school: { label: "School", variant: "outline" },
}

const fullFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
})

function formatFull(date: string): string {
  return fullFormat.format(new Date(date))
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function LiveDate({ date }: { date: string }) {
  const [, tick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const d = new Date(date)
  return <span title={timeAgo(d)}>{formatFull(date)}</span>
}

export function SentMessages() {
  const [messages, setMessages] = React.useState<ApiSentMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [viewMsg, setViewMsg] = React.useState<ApiSentMessage | null>(null)

  const fetchSent = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const token = getToken()
      const res = await getSentMessages(token)
      if (res?.data) setMessages(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch sent messages")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSent()
  }, [fetchSent])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const token = getToken()
      await deleteSentMessage(token, deleteId)
      toast.success("Message deleted successfully")
      setMessages((prev) => prev.filter((m) => m.id !== deleteId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete message")
    } finally {
      setDeleteId(null)
    }
  }

  const formatRecipient = (m: ApiSentMessage): string => {
    if (m.recipient_type === "all_schools") {
      return `All Schools (${m.total_count} admin${m.total_count !== 1 ? "s" : ""})`
    }
    if (m.recipient_type === "school") {
      const name = m.recipient_school_name || `School #${m.recipient_school_id}`
      return `${name} (${m.total_count} admin${m.total_count !== 1 ? "s" : ""})`
    }
    if (m.recipient_type === "individual") {
      return m.sample_recipient_email || `User (${m.total_count} recipient${m.total_count !== 1 ? "s" : ""})`
    }
    return `${m.total_count} recipient(s)`
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {messages.length} sent message{messages.length !== 1 ? "s" : ""}
          </span>
          {messages.length > 0 && (
            <span className="text-xs text-muted-foreground">
              (total recipients: {messages.reduce((sum, m) => sum + m.total_count, 0)})
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchSent} disabled={isLoading}>
          <IconRefresh className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Sent To</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Read</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length ? (
              messages.map((m) => {
                const badge = recipientTypeBadge[m.recipient_type] || recipientTypeBadge.individual
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{m.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{formatRecipient(m)}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell>{m.total_count}</TableCell>
                    <TableCell>
                      {m.total_count > 0 ? (
                        <span className={m.read_count > 0 ? "text-green-600" : "text-muted-foreground"}>
                          {m.read_count}/{m.total_count}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      <LiveDate date={m.created_at} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewMsg(m)}>
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)}>
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : isLoading ? (
              Array.from({ length: 3 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {Array.from({ length: 7 }).map((_, cellIdx) => (
                    <TableCell key={cellIdx}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No sent messages yet. Compose one above!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewMsg} onOpenChange={() => setViewMsg(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewMsg?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">
                {viewMsg ? recipientTypeBadge[viewMsg.recipient_type]?.label || "Individual" : ""}
              </Badge>
              <span className="text-muted-foreground">
                Sent to {viewMsg?.total_count || 0} recipient{viewMsg?.total_count !== 1 ? "s" : ""}
                {viewMsg?.read_count ? ` (${viewMsg.read_count} read)` : ""}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {viewMsg?.recipient_type === "all_schools"
                ? "All School Admins"
                : viewMsg?.recipient_type === "school"
                  ? viewMsg?.recipient_school_name || `School #${viewMsg?.recipient_school_id}`
                  : viewMsg?.sample_recipient_email || "Individual recipient"}
            </div>
            <p className="whitespace-pre-wrap text-sm">{viewMsg?.message}</p>
            <div className="text-xs text-muted-foreground">
              Sent: {viewMsg?.created_at ? <LiveDate date={viewMsg.created_at} /> : ""}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the sent message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)} variant="outline">No</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}