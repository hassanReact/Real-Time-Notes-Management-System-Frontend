import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { RealTimeProvider } from "@/components/real-time-provider"
import { Toaster as SonnerToaster } from "sonner"
import { Suspense } from "react"
// import { Navigation } from "@/components/navigation"
import { AuthProvider } from "@/hooks/use-auth"
import { QueryProvider } from "@/components/query-provider"
import "./globals.css"

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryProvider>
              <AuthProvider>
                <RealTimeProvider>
                  <div className="min-h-screen flex flex-col bg-background text-foreground">
                    {children}
                  </div>
                  <SonnerToaster 
                    position="top-right" 
                    toastOptions={{
                      className: 'sm:max-w-[356px]',
                      style: { maxWidth: 'calc(100vw - 32px)' }
                    }}
                  />
                </RealTimeProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
