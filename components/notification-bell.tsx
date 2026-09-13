"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { IconBell, IconAlertTriangle, IconMail, IconTrash, IconX, IconCheck, IconClock, IconUser } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { AUTH_TOKEN_KEY, checkUserActive, getInbox, markMessageRead, deleteInboxMessage, type ApiMessage } from "@/lib/api"
import { t } from "@/lib/translations"

function useLanguage() {
  const [language, setLanguage] = React.useState("en")

  React.useEffect(() => {
    const saved = localStorage.getItem("language")
    if (saved && ["en", "km", "zh"].includes(saved)) setLanguage(saved)
    const handleChange = () => {
      const saved = localStorage.getItem("language")
      if (saved && ["en", "km", "zh"].includes(saved)) setLanguage(saved)
    }
    window.addEventListener("languagechange", handleChange)
    return () => window.removeEventListener("languagechange", handleChange)
  }, [])

  return language
}

type NotificationItem = {
  id: string
  type: "inactive" | "message"
  title: string
  message: string
  timestamp: Date
  read: boolean
  messageId?: number
}

export function NotificationBell() {
  const language = useLanguage()
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [showInactiveModal, setShowInactiveModal] = React.useState(false)
  const [showMessageModal, setShowMessageModal] = React.useState<NotificationItem | null>(null)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const fetchMessages = React.useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) return

    try {
      const res = await getInbox(token)
      if (res?.data) {
        const msgNotifs: NotificationItem[] = res.data.map((m: ApiMessage) => ({
          id: `msg-${m.id}`,
          type: "message",
          title: m.title,
          message: m.message,
          timestamp: new Date(m.created_at),
          read: !!m.read_at,
          messageId: m.id,
        }))
        setNotifications((prev) => {
          const inactiveOnly = prev.filter((n) => n.type === "inactive")
          const hasUnreadInactive = inactiveOnly.some((n) => !n.read)
          setUnreadCount(res.unread_count + (hasUnreadInactive ? 1 : 0))
          return [...msgNotifs, ...inactiveOnly]
        })
      }
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) return

    const poll = async () => {
      try {
        const res = await checkUserActive(token)
        if (!res.active) {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.type === "inactive")
            if (!exists) {
              const inactiveNotif: NotificationItem = {
                id: "inactive",
                type: "inactive",
                title: t("inactive.title", language),
                message: t("inactive.message", language),
                timestamp: new Date(),
                read: false,
              }
              return [...prev, inactiveNotif]
            }
            return prev
          })
        }
      } catch {
        // ignore polling errors
      }
      await fetchMessages()
    }

    poll()
    const interval = setInterval(poll, 30000)
    return () => clearInterval(interval)
  }, [language, fetchMessages])

  React.useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length)
  }, [notifications])

  const handleViewInactive = () => {
    setPopoverOpen(false)
    setTimeout(() => {
      setShowInactiveModal(true)
    }, 100)
  }

  const handleViewMessage = async (notif: NotificationItem) => {
    setPopoverOpen(false)
    setTimeout(() => {
      setShowMessageModal(notif)
    }, 100)
    if (notif.messageId && !notif.read) {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY)
        if (token) {
          await markMessageRead(token, notif.messageId)
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
          )
        }
      } catch {
        // ignore
      }
    }
  }

  const handleOk = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setShowInactiveModal(false)
    window.location.href = "/login"
  }

  const handleDismiss = () => {
    setShowMessageModal(null)
  }

  React.useEffect(() => {
    if (!showMessageModal && !showInactiveModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showMessageModal) setShowMessageModal(null)
        else if (showInactiveModal) setShowInactiveModal(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [showMessageModal, showInactiveModal])

  const handleDeleteNotification = async (notif: NotificationItem) => {
    if (notif.type !== "message" || !notif.messageId) return
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) {
        await deleteInboxMessage(token, notif.messageId)
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
        if (showMessageModal?.id === notif.id) {
          setShowMessageModal(null)
        }
      }
    } catch {
      // ignore
    }
  }

  const handleClearAll = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (token) {
      const messageNotifs = notifications.filter((n) => n.type === "message" && n.messageId)
      await Promise.allSettled(
        messageNotifs.map((n) => deleteInboxMessage(token, n.messageId!))
      )
    }
    setNotifications([])
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleString(language === "km" ? "km-KH" : language === "zh" ? "zh-CN" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (text: string) => {
    const cleaned = text.trim()
    if (!cleaned) return "M"
    const words = cleaned.split(/\s+/).filter(Boolean)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  const getAvatarGradient = (seed: string) => {
    const gradients = [
      "from-blue-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-violet-500 to-purple-600",
      "from-rose-500 to-pink-600",
      "from-amber-500 to-orange-600",
      "from-cyan-500 to-sky-600",
    ]
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    }
    return gradients[hash % gradients.length]
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
            <IconBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{t("notification.title", language)}</h3>
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button onClick={handleClearAll} className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                {t("notification.clearAll", language)}
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <IconBell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("notification.empty", language)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("notification.emptyHint", language)}</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={n.type === "inactive" ? handleViewInactive : () => handleViewMessage(n)}
                  className={cn(
                    "group relative w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-b last:border-0 hover:bg-muted/60",
                    !n.read && "bg-blue-50/50 dark:bg-blue-950/10"
                  )}
                >
                  {!n.read && (
                    <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500" />
                  )}
                  <div
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105",
                      n.type === "inactive"
                        ? "bg-gradient-to-br from-red-500 to-rose-600"
                        : "bg-gradient-to-br " + getAvatarGradient(n.title)
                    )}
                  >
                    {n.type === "inactive" ? (
                      <IconAlertTriangle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold tracking-wide">
                        {getInitials(n.title)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm text-foreground truncate", !n.read ? "font-semibold" : "font-medium")}>
                        {n.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      {formatTime(n.timestamp)}
                    </p>
                  </div>
                  <div className="shrink-0 self-center flex items-center gap-1">
                    {n.type === "message" && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNotification(n)
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); handleDeleteNotification(n) } }}
                        className="p-1.5 rounded-md text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 cursor-pointer dark:hover:bg-red-950/50"
                        title={t("notification.delete", language)}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                    >
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Inactive account modal */}
      {mounted && showInactiveModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-background shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="relative h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
            <div className="px-5 pt-5 pb-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
                <IconAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1.5">
                {t("inactive.title", language)}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("inactive.message", language)}
              </p>
              <a
                href="https://t.me/nha_officail"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:from-red-600 hover:to-rose-700 hover:shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                {t("inactive.contact", language)}
              </a>
              <div className="mt-4">
                <Button
                  onClick={handleOk}
                  className="w-full"
                  size="sm"
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Message detail modal */}
      {mounted && showMessageModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={handleDismiss}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-xl bg-background shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative header gradient */}
            <div className={cn("relative h-20 shrink-0 bg-gradient-to-br", getAvatarGradient(showMessageModal.title))}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
              <button
                onClick={handleDismiss}
                className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Close"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>

              <div className="absolute -bottom-6 left-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl ring-[3px] ring-background shadow-lg overflow-hidden">
                  <div className={cn("flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br", getAvatarGradient(showMessageModal.title))}>
                    <span className="text-base font-bold text-white tracking-wide drop-shadow">
                      {getInitials(showMessageModal.title)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body - scrollable */}
            <div className="flex-1 overflow-y-auto px-4 pt-10 pb-4">
              {/* Header section */}
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-base font-semibold text-foreground leading-tight pr-2">
                    {showMessageModal.title}
                  </h2>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    <IconMail className="h-2.5 w-2.5" />
                    {t("common.message", language)}
                  </span>
                </div>

                {/* Meta info card */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <div className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-muted-foreground">
                    <IconClock className="h-3 w-3" />
                    <span>{formatFullDate(showMessageModal.timestamp)}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-muted-foreground">
                    <IconUser className="h-3 w-3" />
                    <span>{t("common.system", language)}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <IconCheck className="h-3 w-3" />
                    <span>{t("message.read", language)}</span>
                  </div>
                </div>
              </div>

              {/* Divider with subject style */}
              <div className="mb-2 flex items-center gap-2">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("common.description", language)}
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Message body */}
              <div className="rounded-lg border border-border/60 bg-gradient-to-br from-muted/40 to-muted/10 p-3 text-xs leading-6 text-foreground/90 whitespace-pre-wrap">
                {showMessageModal.message}
              </div>
            </div>

            {/* Footer with actions */}
            <div className="shrink-0 flex items-center justify-between gap-2 border-t bg-muted/20 px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <IconMail className="h-3 w-3" />
                <span>{t("common.message", language)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={handleDismiss}
                  className="h-7 gap-1 px-3 text-[11px] min-w-16"
                >
                  {t("common.close", language)}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
