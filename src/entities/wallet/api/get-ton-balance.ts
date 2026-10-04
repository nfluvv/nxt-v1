import "server-only";
import { fromNano } from "@ton/core";
import type { WalletBalance } from "../model/types";

const BASE_URL = process.env.TON_API_URL ?? "https://toncenter.com/api/v2";
const REVALIDATE_SEC = 20;

export async function getTonBalance(address: string): Promise<WalletBalance> {
  const res = await fetch(
    `${BASE_URL}/getAddressBalance?address=${encodeURIComponent(address)}`,
    {
      headers: process.env.TONCENTER_API_KEY
        ? { "X-API-Key": process.env.TONCENTER_API_KEY }
        : undefined,
      next: { revalidate: REVALIDATE_SEC },
    },
  );

  if (!res.ok) throw new Error(`TON API responded ${res.status}`);

  const data = (await res.json()) as { ok: boolean; result?: string; error?: string };
  if (!data.ok || data.result == null) throw new Error(data.error ?? "TON API error");

  return { nano: data.result, ton: fromNano(data.result) };
}