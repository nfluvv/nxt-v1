import { prisma } from "@/shared/server/db/prisma";
import crypto from "crypto";

export async function generateTonAuthMessage(walletAddress: string) {
  const nonce = crypto.randomBytes(32).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000);
  
  const message = [
    "Please sign this message to authenticate:",
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Timestamp: ${timestamp}`,
  ].join("\n");

  return {
    message,
    nonce,
    timestamp,
  };
}

export async function verifyTonProof(
  walletAddress: string,
  signature: string,
  nonce: string,
  timestamp: number
) {
  const now = Math.floor(Date.now() / 1000);

  if (now - timestamp > 300) {
    throw new Error("Signature expired");
  }

  // TODO: Здесь нужна реальная верификация подписи
  // Для полной реализации нужно использовать ton-crypto для проверки Ed25519 подписи
  
  return true;
}
