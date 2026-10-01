"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { useTranslations } from "next-intl"
import { useTonConnectUI } from "@tonconnect/ui-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/client/ui"

import { unlinkTonWallet } from "../api/link-ton-wallet"

const PROVIDER_NAME = "TON Wallet"

export const UnlinkTonWalletButton = () => {
  const router = useRouter()
  const { update } = useSession()
  const [tonConnectUI] = useTonConnectUI()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const t = useTranslations("linkProvider")
  const tc = useTranslations("common")

  const handleUnlink = async () => {
    setIsPending(true)
    const result = await unlinkTonWallet()
    setIsPending(false)
    setConfirmOpen(false)

    if (!result.success) {
      toast.error(t(`tonErrors.${result.error}`))
      return
    }

    if (tonConnectUI.connected) await tonConnectUI.disconnect()

    toast.success(t("unlinkSuccess", { provider: PROVIDER_NAME }))
    await update()
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="group relative flex h-8 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
      >
        <span className="relative flex items-center gap-1 text-xs font-medium transition-opacity duration-150 group-hover:opacity-0">
          {t("active")}
        </span>
        <span className="absolute inset-0 flex items-center justify-center gap-1 text-xs font-medium text-destructive opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <X className="size-3" />
          {t("unlink")}
        </span>
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("unlinkTitle", { provider: PROVIDER_NAME })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("unlinkDescription", { provider: PROVIDER_NAME })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlink}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isPending ? t("unlinkPending") : t("unlink")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}