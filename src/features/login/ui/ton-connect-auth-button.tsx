"use client"

import { useState, useEffect } from "react"
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Wallet, Loader2 } from "lucide-react"
import { Button } from "@/shared/client/ui"
import { useTranslations } from "next-intl"

export function TonConnectAuthButton() {
  const [tonConnectUI, setOptions] = useTonConnectUI()
  const wallet = useTonWallet()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations("Auth")

  const [proofPayload, setProofPayload] = useState<string | null>(null)

  useEffect(() => {
    const payload = globalThis.crypto.randomUUID()
    setProofPayload(payload)

    tonConnectUI.setConnectRequestParameters({
      state: "ready",
      value: { tonProof: payload },
    })
  }, [tonConnectUI])

  const handleLogin = async () => {
    if (!proofPayload) {
      toast.error("Proof payload not ready")
      return
    }

    try {
      setIsLoading(true)

      const newPayload = globalThis.crypto.randomUUID()
      tonConnectUI.setConnectRequestParameters({
        state: "ready",
        value: { tonProof: newPayload },
      })

      const connectedWallet = await tonConnectUI.connectWallet()

      if (!connectedWallet?.account?.address) {
        console.log("Connection canceled")
        return
      }

      const tonProof = connectedWallet.connectItems?.tonProof
      
      if (!tonProof || !("proof" in tonProof)) {
        toast.error("Wallet does not support ton-proof")
        return
      }

      const { proof } = tonProof

      const res = await signIn("ton-connect", {
        address: connectedWallet.account.address,
        publicKey: connectedWallet.account.publicKey,
        proof: JSON.stringify(proof),
        redirect: false,
      })

      if (res?.error) {
        throw new Error(res.error)
      }

      toast.success(t("successLogin") || "Успешный вход")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      toast.error(t("tonSignInError") || "Ошибка входа через TON")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleLogin}
      disabled={isLoading || !proofPayload}
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 size-4" />
      )}
      {wallet ? t("signInWithTon") || "Войти через TON" : t("connectTonWallet") || "Подключить TON кошелёк"}
    </Button>
  )
}