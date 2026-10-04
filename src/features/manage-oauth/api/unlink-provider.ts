"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/shared/server/db/prisma"

type UnlinkResult = { success: true } | { success: false; error: string }

export const unlinkProvider = async (
  provider: "google" | "github"
): Promise<UnlinkResult> => {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      accounts: { select: { provider: true } },
    },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  const otherOAuthAccounts = user.accounts.filter((a) => a.provider !== provider)

  if (!otherOAuthAccounts) {
    return {
      success: false,
      error: "Cannot disconnect the only login method for the account",
    }
  }

  await prisma.account.deleteMany({
    where: { userId: session.user.id, provider },
  })

  revalidatePath("/settings")
  return { success: true }
}