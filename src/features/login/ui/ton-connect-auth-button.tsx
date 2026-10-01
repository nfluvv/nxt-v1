"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { Wallet } from "lucide-react";

export function TonConnectAuthButton() {
  const [tonConnectUI] = useTonConnectUI();


  useEffect(() => {
    tonConnectUI.setConnectRequestParameters({ state: "loading" });
    fetch("/api/ton/payload")
      .then((r) => r.json())
      .then(({ payload }) =>
        tonConnectUI.setConnectRequestParameters({ state: "ready", value: { tonProof: payload } }),
      );
  }, [tonConnectUI]);

  useEffect(
    () =>
      tonConnectUI.onStatusChange(async (wallet) => {
        const item = wallet?.connectItems?.tonProof;
        if (!wallet || !item || !("proof" in item)) return;

        await signIn("ton", {
          address: wallet.account.address,
          publicKey: wallet.account.publicKey,
          stateInit: wallet.account.walletStateInit,
          proof: JSON.stringify(item.proof),
          redirectTo: "/dashboard",
        });
      }),
    [tonConnectUI],
  );

  const onClick = async () => {
    if (tonConnectUI.connected) await tonConnectUI.disconnect();
    await tonConnectUI.openModal();
  };

  return (
    <button onClick={onClick} className="...">
      <Wallet className="size-4" /> TON Wallet
    </button>
  );
}