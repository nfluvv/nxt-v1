"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/shared/server/db/prisma"

type UnlinkResult = { success: true } | { success: false; error: string }

export const unlinkTonWallet = async (): Promise<UnlinkResult> => {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      accounts: { select: { provider: true } },
    },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  const hasOtherLoginMethod = Boolean(user.email) || user.accounts.length > 0
  
  if (!hasOtherLoginMethod) {
    return {
      success: false,
      error: "It is not possible to unlink the only login method for the account.",
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: null },
  })

  revalidatePath("/settings")
  return { success: true }
}