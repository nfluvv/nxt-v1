"use client"

import { useState } from "react"
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Wallet, Loader2 } from "lucide-react"
import { Button } from "@/shared/client/ui"
import { useTranslations } from "next-intl"

export function TonConnectAuthButton() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)  
  const t = useTranslations("Auth")
  
  const handleLogin = async () => {
    try {
      setIsLoading(true)

      let targetWallet = wallet

      if (!targetWallet) {
        targetWallet = await tonConnectUI.connectWallet()
      }

      if (!targetWallet?.account?.address || !targetWallet?.account?.publicKey) {
        console.log("Connection canceled")
        return 
      }

      const nonce = globalThis.crypto.randomUUID()
      const result = await tonConnectUI.signData({
        type: "text",
        text: nonce,
      })

      const res = await signIn("ton-connect", {
        address: targetWallet.account.address,
        publicKey: targetWallet.account.publicKey,
        nonce,
        signature: result.signature,
        redirect: false,
      })

      if (res?.error) throw new Error(res.error)

      toast.success("success login")
      router.push("/dashboard")
      router.refresh()

    } catch {
      toast.error(t("tonError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleLogin} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Wallet className="mr-2 size-4" />}
      {wallet ? t("loginViaTon") : t("connectTon")}
    </Button>
  )
}