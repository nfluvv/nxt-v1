"use client"

import { useState } from "react"
import { useTonConnectUI } from "@tonconnect/ui-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { useTranslations } from "next-intl"
import { Wallet, Loader2 } from "lucide-react"

import { Button } from "@/shared/client/ui"
import { linkTonWallet } from "../api/link-ton-wallet"

export function LinkTonWalletButton() {
  const [tonConnectUI] = useTonConnectUI()
  const router = useRouter()
  const t = useTranslations("linkProvider")
  const [isLoading, setIsLoading] = useState(false)

  const handleLink = async () => {
    try {
      setIsLoading(true)
      
      const connectedWallet = await tonConnectUI.connectWallet()

      if (!connectedWallet?.account?.address || !connectedWallet?.account?.publicKey) {
        throw new Error("The wallet was not connected or the data is incomplete.")
      }

      const nonce = globalThis.crypto.randomUUID()
      const result = await tonConnectUI.signData({
        type: "text",
        text: nonce,
      })

      const res = await linkTonWallet(
        connectedWallet.account.address,
        connectedWallet.account.publicKey,
        nonce,
        result.signature
      )

      if (!res.success) {
        throw new Error(res.error)
      }

      toast.success(t("linkSuccess", { provider: "TON" }) || "Кошелёк успешно привязан")
      router.refresh()
    } catch (error) {
      console.error("Link TON error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка привязки кошелька")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLink}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-3 animate-spin" />
      ) : (
        <Wallet className="mr-2 size-3" />
      )}
      {t("link")}
    </Button>
  )
}