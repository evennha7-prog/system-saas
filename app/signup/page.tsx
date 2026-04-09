import { SignupForm } from "@/components/signup-form"

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]" />
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gradient-to-l from-primary/20 to-primary/5 blur-3xl" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome</h1>
          <p className="mt-2 text-sm text-muted-foreground">Join us and start your journey</p>
        </div>
        <SignupForm className="shadow-xl shadow-black/5 rounded-xl border-border/50 bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80" />
      </div>
    </div>
  )
}
