"use client"

import { useState, useEffect } from "react"
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
  const [proofPayload, setProofPayload] = useState<string | null>(null)

  useEffect(() => {
    const payload = globalThis.crypto.randomUUID()
    setProofPayload(payload)
    tonConnectUI.setConnectRequestParameters({
      state: "ready",
      value: { tonProof: payload },
    })
  }, [tonConnectUI])

  const handleLink = async () => {
    if (!proofPayload) return

    try {
      setIsLoading(true)

      const newPayload = globalThis.crypto.randomUUID()
      tonConnectUI.setConnectRequestParameters({
        state: "ready",
        value: { tonProof: newPayload },
      })

      const connectedWallet = await tonConnectUI.connectWallet()

      if (!connectedWallet?.account?.address || !connectedWallet?.account?.publicKey) {
        throw new Error("Кошелёк не подключен")
      }

      const tonProofItem = connectedWallet.connectItems?.tonProof
      if (!tonProofItem || !("proof" in tonProofItem)) {
        throw new Error("Кошелёк не поддерживает ton-proof")
      }

      const res = await linkTonWallet(
        connectedWallet.account.address,
        connectedWallet.account.publicKey,
        JSON.stringify(tonProofItem.proof)
      )

      if (!res.success) {
        throw new Error(res.error)
      }

      toast.success(t("linkSuccess", { provider: "TON" }) || "Кошелёк привязан")
      router.refresh()
    } catch (error) {
      console.error("Link TON error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка привязки")
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
      disabled={isLoading || !proofPayload}
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-3 animate-spin" />
      ) : (
        <Wallet className="mr-2 size-3" />
      )}
      {t("link") || "Привязать"}
    </Button>
  )
}