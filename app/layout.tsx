import type { Metadata } from "next";
import { Roboto, Hanuman } from "next/font/google";
// import { Suspense } from "react" // removed to avoid hydration mismatch
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SearchProvider } from "@/components/global-search";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import { ClientScripts } from "@/components/client-scripts";
import { BisSkinChecker } from "@/components/bis-skin-checker";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const hanuman = Hanuman({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["khmer"],
  variable: "--font-khmer",
});

export const metadata: Metadata = {
  title: "NK ONE School",
  description: "Admin Management System",
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="manifest" href="/manifest.json" />
        <ClientScripts />
      </head>
      <body className={cn("min-h-full flex flex-col font-sans", roboto.variable, hanuman.variable)} suppressHydrationWarning>
        <BisSkinChecker />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          noScript
        >
          <TooltipProvider>
            <SearchProvider>
              <AuthProvider>
                {children}
                <Toaster richColors closeButton position="top-right" />
              </AuthProvider>
            </SearchProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
