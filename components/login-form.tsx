import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "sonner"
import { AUTH_TOKEN_KEY, login, getUser } from "@/lib/api"
import { IconLoader2 } from "@tabler/icons-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault()
     setIsLoading(true)
     setError(null)
     try {
       const response = await login(email, password)
       localStorage.setItem(AUTH_TOKEN_KEY, response.token)
       
       // Small delay to ensure token is stored before navigation
       await new Promise(resolve => setTimeout(resolve, 100))
       
       const userData = await getUser(response.token)
       
       // Second delay to ensure state updates
       await new Promise(resolve => setTimeout(resolve, 100))
       
       if (userData.user_type === "SUPER_ADMIN") {
         window.location.href = "/dashboard/super-admin"
       } else if (userData.user_type === "SCHOOL_ADMIN") {
         window.location.href = "/dashboard/school-admin"
       } else {
         window.location.href = "/dashboard"
       }
     } catch (err) {
       const message = err instanceof Error ? err.message : "Login failed"
       setError(message)
     } finally {
       setIsLoading(false)
     }
   }

  return (
    <div className={cn("flex flex-col gap-6", className)} suppressHydrationWarning {...props}>
      <Card>
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="size-14 rounded-2xl overflow-hidden border border-border shadow-sm bg-background p-1 flex items-center justify-center">
              <Image
                src="/resources/avatar/nk.png"
                alt="NK ONE School"
                width={56}
                height={56}
                className="size-full object-cover rounded-xl"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-xl">Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
               <Field>
                 <div className="flex items-center" suppressHydrationWarning>
                   <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="ms-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                 </div>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <IconLoader2 className="animate-spin" />}
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Field>
              <Field>
                <Button variant="outline" type="button" className="flex items-center gap-2 w-full" disabled={isLoading} onClick={() => toast.info("Login with Google is coming Soon")}>
                  <img src="/avatar/logogoogle.webp" alt="Google" className="w-5 h-5" />
                  Login with Google
                </Button>
              </Field>
              {error ? (
                <div className="text-center">
                  {error.toLowerCase().includes("pending") ? (
                    <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <p className="text-sm text-amber-700 font-medium">Account Pending Approval</p>
                      <p className="text-xs text-amber-600">Your account is waiting for administrator approval. You will be notified once approved.</p>
                      <a
                        href="https://t.me/nha_officail"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Contact Admin on Telegram
                      </a>
                    </div>
                  ) : error.toLowerCase().includes("inactive") ? (
                    <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <p className="text-sm text-red-700 font-medium">Your account has been disabled</p>
                      <p className="text-xs text-red-600">Please contact the admin for assistance</p>
                      <a
                        href="https://t.me/nha_officail"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Contact Admin on Telegram
                      </a>
                    </div>
                  ) : (
                    <span className="text-destructive">{error}</span>
                  )}
                </div>
              ) : null}
              <Field>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
