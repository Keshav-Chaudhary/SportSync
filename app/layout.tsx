import React from "react"
import type { Metadata } from 'next'
import { Outfit, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/theme-provider"
import './globals.css'

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'SportSync - Gym & Equipment Management',
  description: 'University sports equipment lending and gym entry management system',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background flex flex-col relative`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Decorative Background Effects */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] dark:bg-[var(--accent)] bg-foreground opacity-[0.03] dark:opacity-[0.08] blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-primary opacity-[0.02] dark:opacity-[0.05] blur-[150px] rounded-full pointer-events-none -z-10" />
          
          <div className="relative z-0 flex flex-col flex-1 w-full">
            {children}
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
