import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { RealTimeProvider } from "@/components/real-time-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/hooks/use-auth"
import "./globals.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false // Don't retry auth errors
        return failureCount < 3
      },
    },
  },
})

export const metadata: Metadata = {
  title: "Notes Management System",
  description: "Modern notes app with real-time collaboration",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <RealTimeProvider>
                  <Navigation>{children}</Navigation>
                  <Toaster />
                  <SonnerToaster position="top-right" />
                </RealTimeProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
