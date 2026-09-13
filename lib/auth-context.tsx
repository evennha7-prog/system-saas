"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AUTH_TOKEN_KEY, getUser, UserResponse } from "@/lib/api"

type UserType = "SUPER_ADMIN" | "SCHOOL_ADMIN"

interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  checkPermission: (requiredType: UserType | UserType[]) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [inactiveMessage, setInactiveMessage] = React.useState<string | null>(null)
  const router = useRouter()

  const fetchCurrentUser = React.useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const userData = await getUser(token)
      setUser(userData)
      setIsLoading(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (message.toLowerCase().includes("inactive")) {
        setInactiveMessage(message)
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setUser(null)
        setIsLoading(false)
      }
    }
  }, [])

  React.useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const handleInactiveOk = React.useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setUser(null)
    setInactiveMessage(null)
    setIsLoading(false)
    router.push("/login")
  }, [router])

  const login = React.useCallback(async (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    try {
      const userData = await getUser(token)
      setUser(userData)
    } catch (error) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      setUser(null)
      throw error
    }
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setUser(null)
    router.push("/login")
  }, [router])

  const checkPermission = React.useCallback(
    (requiredType: UserType | UserType[]) => {
      if (!user) return false
      const types = Array.isArray(requiredType) ? requiredType : [requiredType]
      return types.includes(user.user_type)
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkPermission,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
      {inactiveMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              maxWidth: 420,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
                color: "#111",
              }}
            >
              Account Disabled
            </h2>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 4, lineHeight: 1.6 }}>
              Your account has been disabled. Please contact the admin for assistance.
            </p>
            <a
              href="https://t.me/nha_officail"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                marginBottom: 20,
                padding: "10px 20px",
                background: "#dc2626",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Contact Admin on Telegram
            </a>
            <div>
              <button
                onClick={handleInactiveOk}
                style={{
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 32px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}