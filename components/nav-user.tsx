"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
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
import { IconDotsVertical, IconUserCircle, IconLogout, IconHeadset, IconAlertTriangle, IconSun, IconMoon, IconMessage, IconFileDescription, IconShield, IconBell } from "@tabler/icons-react"
import { useTheme } from "@teispace/next-themes"
import { AUTH_TOKEN_KEY, logout } from "@/lib/api"

function getInitials(name: string): string {
  return name
    .split(/[\s_]+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    phone: string
  }
}) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const isDark = theme === "dark"

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) {
        await logout(token)
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      router.push("/login")
    }
  }

  return (
    <>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 rounded-lg ring-2 ring-sidebar-border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-xs font-semibold text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-green-500" />
              </div>
              <div className="grid flex-1 text-start text-xs leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ms-auto size-4 text-muted-foreground/60 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-72 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-1 py-1.5 text-start text-sm">
                <Avatar className="h-9 w-9 rounded-lg ring-2 ring-sidebar-border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-xs font-semibold text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="truncate text-[11px] text-muted-foreground/60">
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-3" onClick={() => router.push("/dashboard/settings")}>
                <IconUserCircle className="size-4 text-muted-foreground" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                <IconBell className="size-4 text-muted-foreground" />
                <span>Allow Notifications</span>
                <span className={`ms-auto h-5 w-9 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-muted'} relative`}>
                  <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3" onClick={() => setTheme(isDark ? "light" : "dark")}>
                {isDark ? <IconSun className="size-4 text-muted-foreground" /> : <IconMoon className="size-4 text-muted-foreground" />}
                <span>Dark Mode</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-3 py-1.5 text-xs text-muted-foreground">Other</DropdownMenuLabel>
            <DropdownMenuItem className="gap-3 group" onClick={() => router.push("/dashboard/help")}>
              <IconHeadset className="size-4 text-muted-foreground transition-all duration-300 group-hover:animate-headset-bounce" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 group" onClick={() => router.push("/dashboard/feedback")}>
              <IconMessage className="size-4 text-muted-foreground transition-all duration-300 group-hover:animate-mail-wiggle" />
              <span>Feedback</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3" onClick={() => router.push("/dashboard/terms")}>
              <IconFileDescription className="size-4 text-muted-foreground" />
              <span>Terms</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3" onClick={() => router.push("/dashboard/privacy")}>
              <IconShield className="size-4 text-muted-foreground" />
              <span>Privacy Policy</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="gap-3 text-destructive focus:text-destructive">
              <IconLogout className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)} variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} variant="destructive">Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
