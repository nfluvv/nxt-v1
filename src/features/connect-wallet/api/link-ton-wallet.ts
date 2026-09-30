"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/shared/server/db/prisma"
import { verifyTonProof } from "@/shared/server/auth/crypto"

type LinkResult = { success: true } | { success: false; error: string }

export const linkTonWallet = async (
  address: string,
  publicKey: string,
  proofJson: string
): Promise<LinkResult> => {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Не авторизован" }
  }

  const existingUser = await prisma.user.findUnique({
    where: { walletAddress: address },
    select: { id: true },
  })

  if (existingUser && existingUser.id !== session.user.id) {
    return {
      success: false,
      error: "Этот кошелёк уже привязан к другому аккаунту",
    }
  }

  const isValid = await verifyTonProof(address, publicKey, proofJson)
  if (!isValid) {
    return { success: false, error: "Неверная криптографическая подпись" }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: address },
  })

  revalidatePath("/settings")
  return { success: true }
}