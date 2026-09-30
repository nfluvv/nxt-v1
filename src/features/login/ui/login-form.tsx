"use client"

import { useTranslations } from "next-intl"
import { OAuthButtons } from "./oauth-buttons"
import { TonConnectAuthButton } from "./ton-connect-auth-button" 

export function LoginForm() {
  const t = useTranslations("Auth")

  return (
    <div className="flex flex-col gap-6">
      <OAuthButtons />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("or")}
          </span>
        </div>
      </div>

      <TonConnectAuthButton />
    </div>
  )
}