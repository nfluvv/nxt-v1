
"use client";

import { useWalletBalance } from "../model/use-wallet-balance";
import { formatTon } from "../lib/format-ton";
import type { WalletBalance } from "../model/types";

export function WalletBalanceView({ initialData }: { initialData?: WalletBalance | null }) {
  const { data, isError } = useWalletBalance(initialData);

  if (data === null) return null;
  if (!data) {
    return isError ? (
      <span className="text-muted-foreground">—</span>
    ) : (
      <span className="inline-block h-4 w-16 animate-pulse rounded bg-muted" />
    );
  }

  return (
    <span className="tabular-nums">
      {formatTon(data.nano)} <span className="text-muted-foreground">TON</span>
    </span>
  );
}