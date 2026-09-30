"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { useTranslations } from "next-intl"
import { Loader2, X } from "lucide-react"

import { Button } from "@/shared/client/ui"
import { unlinkTonWallet } from "../api/unlink-ton-wallet"

export function UnlinkTonWalletButton() {
  const router = useRouter()
  const t = useTranslations("linkProvider")
  const [isLoading, setIsLoading] = useState(false)

  const handleUnlink = async () => {
    if (!confirm(t("unlinkConfirm") || "Вы уверены, что хотите отвязать TON кошелёк?")) {
      return
    }

    try {
      setIsLoading(true)
      const res = await unlinkTonWallet()

      if (!res.success) {
        throw new Error(res.error)
      }

      toast.success(t("unlinkSuccess", { provider: "TON" }) || "Кошелёк отвязан")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка отвязки")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleUnlink}
      disabled={isLoading}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-3 animate-spin" />
      ) : (
        <X className="mr-2 size-3" />
      )}
      {t("unlink")}
    </Button>
  )
}