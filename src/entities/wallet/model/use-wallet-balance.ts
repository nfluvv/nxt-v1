"use client";

import { useQuery } from "@tanstack/react-query";
import type { WalletBalance } from "./types";

export const walletBalanceKey = ["wallet", "balance"] as const;

async function fetchBalance(): Promise<WalletBalance | null> {
  const res = await fetch("/api/wallet/balance");
  if (!res.ok) throw new Error("Failed to load balance");
  return (await res.json()).balance;
}

export function useWalletBalance(initialData?: WalletBalance | null) {
  return useQuery({
    queryKey: walletBalanceKey,
    queryFn: fetchBalance,
    initialData,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}