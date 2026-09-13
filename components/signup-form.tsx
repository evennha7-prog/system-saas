"use client"

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
import { register } from "@/lib/api"
import { IconLoader2 } from "@tabler/icons-react"

// ── Step indicator ─────────────────────────────────────────
function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
              i + 1 <= step
                ? "bg-primary text-primary-foreground shadow-md scale-110"
                : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1 < step ? (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div
              className={cn(
                "h-0.5 w-10 rounded-full transition-all duration-500",
                i + 1 < step ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [step, setStep] = React.useState(1)

  const [accountData, setAccountData] = React.useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
    confirmPassword: "",
  })

  const [schoolData, setSchoolData] = React.useState({
    student_code_prefix: "",
    school_enname: "",
    student_code_suffix: "",
    student_code_digit: "",
    school_khname: "",
    school_zhname: "",
    school_short: "",
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showSuccess, setShowSuccess] = React.useState(false)

  const handleAccountChange = (field: string, value: string) =>
    setAccountData((prev) => ({ ...prev, [field]: value }))

  const handleSchoolChange = (field: string, value: string) =>
    setSchoolData((prev) => ({ ...prev, [field]: value }))

  // ── Step 1 → 2 validation ──
  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!accountData.username.trim()) {
      setError("Full name is required")
      return
    }
    if (!accountData.email.trim()) {
      setError("Email is required")
      return
    }
    if (accountData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (accountData.password !== accountData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setStep(2)
  }


  // ── Final submit ──
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!schoolData.school_enname.trim()) {
      setError("English school name is required")
      setIsLoading(false)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _omit, ...registerFields } = accountData
      await register({
        ...registerFields,
        user_type: "SCHOOL_ADMIN",
        ...schoolData,
      })
      setShowSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Success screen ──
  if (showSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} suppressHydrationWarning {...props}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Account Pending Approval</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your account has been created successfully and is waiting for administrator approval.
                You will be able to log in once your account is approved.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 mt-4">
                <a
                  href="https://t.me/nha_officail"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0088cc] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0088cc]/90 transition-all hover:-translate-y-0.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  Contact Admin
                </a>
              </div>
              <div className="mt-4 w-full border-t border-border pt-4">
                <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/login")}>
                  Return to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} suppressHydrationWarning {...props}>
      <Card>
        <CardHeader className="text-center pb-2 space-y-3">
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
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>
              {step === 1
                ? "Step 1 — Enter your account details"
                : "Step 2 — Enter your school information"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <StepIndicator step={step} total={2} />

          {/* ── Step 1: Account info ── */}
          {step === 1 && (
            <form onSubmit={handleNextStep}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Full Name</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={accountData.username}
                    onChange={(e) => handleAccountChange("username", e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={accountData.email}
                    onChange={(e) => handleAccountChange("email", e.target.value)}
                  />
                  <FieldDescription>
                    We&apos;ll use this to contact you and it cannot be changed later.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0XX XXX XXX"
                    value={accountData.phonenumber}
                    onChange={(e) => handleAccountChange("phonenumber", e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    id="password"
                    required
                    value={accountData.password}
                    onChange={(e) => handleAccountChange("password", e.target.value)}
                  />
                  <FieldDescription>Must be at least 6 characters long.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                  <PasswordInput
                    id="confirm-password"
                    required
                    value={accountData.confirmPassword}
                    onChange={(e) => handleAccountChange("confirmPassword", e.target.value)}
                  />
                </Field>

                {error && (
                  <Field>
                    <FieldDescription className="text-center text-destructive">
                      {error}
                    </FieldDescription>
                  </Field>
                )}

                <Field>
                  <Button type="submit" className="w-full">
                    Next — School Info →
                  </Button>
                </Field>

                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    className="flex items-center gap-2 w-full"
                    onClick={() => toast.info("Sign up with Google is coming soon")}
                  >
                    <img src="/avatar/logogoogle.webp" alt="Google" className="w-5 h-5" />
                    Sign up with Google
                  </Button>
                </Field>

                <Field>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-primary underline underline-offset-4">
                      Sign in
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}

          {/* ── Step 2: School info ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {/* Section label */}
                <div className="rounded-lg bg-muted/40 border px-4 py-3 mb-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    School Names
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Provide your school name in multiple languages. English name is required.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="school_prefix_name">Prefix Name</FieldLabel>
                    <Input
                      id="school_prefix_name"
                      type="text"
                      placeholder="Ex: The"
                      value={schoolData.student_code_prefix}
                      onChange={(e) => handleSchoolChange("student_code_prefix", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="school_enname">
                      English Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="school_enname"
                      type="text"
                      placeholder="Ex: NK ONE School"
                      required
                      value={schoolData.school_enname}
                      onChange={(e) => handleSchoolChange("school_enname", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="school_suffix_name">Suffix Name</FieldLabel>
                    <Input
                      id="school_suffix_name"
                      type="text"
                      placeholder="Ex: Campus"
                      value={schoolData.student_code_suffix}
                      onChange={(e) => handleSchoolChange("student_code_suffix", e.target.value)}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="school_digit">Digit</FieldLabel>
                  <Input
                    id="school_digit"
                    type="text"
                    placeholder="Enter digit"
                    value={schoolData.student_code_digit}
                    onChange={(e) => handleSchoolChange("student_code_digit", e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="school_khname">Khmer Name</FieldLabel>
                  <Input
                    id="school_khname"
                    type="text"
                    placeholder="ឧ: សាលា NK ONE"
                    value={schoolData.school_khname}
                    onChange={(e) => handleSchoolChange("school_khname", e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="school_zhname">Chinese Name</FieldLabel>
                  <Input
                    id="school_zhname"
                    type="text"
                    placeholder="例: NK ONE学校"
                    value={schoolData.school_zhname}
                    onChange={(e) => handleSchoolChange("school_zhname", e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="school_short">Short Name / Abbreviation</FieldLabel>
                  <Input
                    id="school_short"
                    type="text"
                    placeholder="Ex: NK ONE"
                    value={schoolData.school_short}
                    onChange={(e) => handleSchoolChange("school_short", e.target.value)}
                  />
                  <FieldDescription>
                    Used in student codes and reports.
                  </FieldDescription>
                </Field>

                {error && (
                  <Field>
                    <FieldDescription className="text-center text-destructive">
                      {error}
                    </FieldDescription>
                  </Field>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setStep(1); setError(null) }}
                    disabled={isLoading}
                  >
                    ← Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading && <IconLoader2 className="animate-spin" />}
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>

                <Field>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-primary underline underline-offset-4">
                      Sign in
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}


        </CardContent>
      </Card>
    </div>
  )
}
