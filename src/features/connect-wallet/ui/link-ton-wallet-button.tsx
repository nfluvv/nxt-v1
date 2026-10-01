// features/connect-wallet/ui/link-ton-wallet-button.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { useTranslations } from "next-intl"
import { useTonConnectUI } from "@tonconnect/ui-react"

import { linkTonWallet } from "../api/link-ton-wallet"

export const LinkTonWalletButton = () => {
  const router = useRouter()
  const { update } = useSession()
  const [tonConnectUI] = useTonConnectUI()
  const [isPending, setIsPending] = useState(false)

  // Реагируем на подключение только если его инициировал клик по кнопке
  const initiatedRef = useRef(false)

  const t = useTranslations("linkProvider")

  // Challenge с сервера
  useEffect(() => {
    tonConnectUI.setConnectRequestParameters({ state: "loading" })
    fetch("/api/ton/payload")
      .then((r) => r.json())
      .then(({ payload }) =>
        tonConnectUI.setConnectRequestParameters({
          state: "ready",
          value: { tonProof: payload },
        })
      )
      .catch(() => tonConnectUI.setConnectRequestParameters(null))
  }, [tonConnectUI])

  // Получили proof → привязываем
  useEffect(
    () =>
      tonConnectUI.onStatusChange(async (wallet) => {
        const item = wallet?.connectItems?.tonProof
        if (!initiatedRef.current || !wallet || !item || !("proof" in item)) return
        initiatedRef.current = false

        setIsPending(true)
        const result = await linkTonWallet({
          address: wallet.account.address,
          publicKey: wallet.account.publicKey,
          stateInit: wallet.account.walletStateInit,
          proof: JSON.stringify(item.proof),
        })
        setIsPending(false)

        if (!result.success) {
          toast.error(t(`tonErrors.${result.error}`))
          await tonConnectUI.disconnect()
          return
        }

        toast.success(t("linkSuccess", { provider: "TON Wallet" }))
        await update() // обновит walletAddress в JWT
        router.refresh()
      }),
    [tonConnectUI, router, update, t]
  )

  const handleClick = async () => {
    initiatedRef.current = true
    // Если сессия TON Connect восстановилась из localStorage, proof не придёт
    if (tonConnectUI.connected) await tonConnectUI.disconnect()
    await tonConnectUI.openModal()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="group relative flex h-8 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-background transition-colors hover:bg-emerald-500/10 hover:text-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="relative flex items-center gap-1 text-xs font-medium">
        {isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Plus className="size-3" />
        )}
        {t("link")}
      </span>
    </button>
  )
}