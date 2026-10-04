import "server-only";
import { auth } from "@/auth";
import { getTonBalance } from "./get-ton-balance";
import type { WalletBalance } from "../model/types";

export async function getUserBalance(): Promise<WalletBalance | null> {
  const session = await auth();
  const address = session?.user?.walletAddress;
  if (!address) return null;

  return getTonBalance(address);
}