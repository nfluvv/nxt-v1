"use client"

import type { PropsWithChildren } from "react"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import { TonConnectUIProvider } from "@tonconnect/ui-react"

import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "./theme-provider"

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <TonConnectUIProvider manifestUrl="https://nxtemplate.vercel.app/tonconnect-manifest.json">
          <QueryProvider>
            {children}

            <Toaster
              position="top-center"
              toastOptions={{
                className: "toast",
                duration: 3000,
              }}
            />
          </QueryProvider>
        </TonConnectUIProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}