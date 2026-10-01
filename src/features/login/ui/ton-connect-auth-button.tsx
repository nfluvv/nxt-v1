"use client";

import { useEffect, useState } from "react";
import { TonConnectUI } from "@tonconnect/ui";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/client/ui";
import { generateTonAuthMessage } from "@/entities/wallet/api/generate-ton-message";

const manifestUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/tonconnect-manifest.json`;

export function TonConnectAuthButton() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [tonConnectUI, setTonConnectUI] = useState<TonConnectUI | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tonConnect = new TonConnectUI({
      manifestUrl,
    });
    setTonConnectUI(tonConnect);

    const unsubscribe = tonConnect.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnected(wallet.account.address);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function handleWalletConnected(walletAddress: string) {
    if (!tonConnectUI) return;

    setIsLoading(true);
    try {
      const { message, nonce, timestamp } = await generateTonAuthMessage(
        walletAddress
      );

      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: walletAddress,
            amount: "0",
            payload: Buffer.from(message, "utf-8").toString("hex"),
          },
        ],
      });

      const signature = result.boc;

      const signInResult = await signIn("ton-wallet", {
        walletAddress,
        signature,
        nonce,
        timestamp,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard");
      } else {
        console.error("Sign in failed:", signInResult?.error);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect() {
    if (!tonConnectUI) return;
    
    try {
      await tonConnectUI.connectWallet();
    } catch (error) {
      console.error("Connection error:", error);
    }
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="w-full"
      variant="outline"
    >
      {isLoading ? t("signing") : t("connectTonWallet")}
    </Button>
  );
}
