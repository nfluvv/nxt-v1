"use client"

import { useState } from "react"
import { Plus, X, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { useTranslations } from "next-intl"

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

import { unlinkProvider } from "../api/unlink-provider"

type Provider = "google" | "github"

type LinkProviderButtonProps = {
  provider: Provider
  isLinked: boolean
  providerName: string
}

export const LinkProviderButton = ({
  provider,
  isLinked,
  providerName,
}: LinkProviderButtonProps) => {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const t = useTranslations("linkProvider")
  const tc = useTranslations("common")

  if (!isLinked) {
    return (
      <button
        type="button"
        onClick={() =>
          signIn(provider, {
            callbackUrl: "/settings?linked=1",
          })
        }
        className="group relative flex h-8 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-background transition-colors hover:bg-emerald-500/10 hover:text-emerald-500"
      >
        <span className="relative flex items-center gap-1 text-xs font-medium">
          <Plus className="size-3" />
          {t("link")}
        </span>
      </button>
    )
  }

  const handleUnlink = async () => {
    setIsPending(true)
    const result = await unlinkProvider(provider)
    setIsPending(false)
    setConfirmOpen(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(t("unlinkSuccess", { provider: providerName }))
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
              {t("unlinkTitle", { provider: providerName })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("unlinkDescription", { provider: providerName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {tc("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnlink} 
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {isPending ? t("unlinkPending") : t("unlink")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}