"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/shared/server/db/prisma"
import { verifyTonSignature } from "@/shared/server/auth/crypto"

type LinkResult = { success: true } | { success: false; error: string }

export const linkTonWallet = async (
  address: string,
  publicKey: string,
  nonce: string,
  signature: string
): Promise<LinkResult> => {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const existingUser = await prisma.user.findUnique({
    where: { walletAddress: address },
    select: { id: true },
  })

  if (existingUser && existingUser.id !== session.user.id) {
    return {
      success: false,
      error: "This wallet is already linked to another account.",
    }
  }

  const isValid = await verifyTonSignature(address, signature, nonce, publicKey)
  if (!isValid) {
    return { success: false, error: "Wrong signature" }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: address },
  })

  revalidatePath("/settings")
  return { success: true }
}