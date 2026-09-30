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
    return { success: false, error: "Не авторизован" }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      walletAddress: true, // Проверяем наличие Web3 входа
      accounts: { select: { provider: true } },
    },
  })

  if (!user) {
    return { success: false, error: "Пользователь не найден" }
  }

  const otherOAuthAccounts = user.accounts.filter((a) => a.provider !== provider)
  const hasOtherLoginMethod = Boolean(user.walletAddress) || otherOAuthAccounts.length > 0

  if (!hasOtherLoginMethod) {
    return {
      success: false,
      error: "Невозможно отключить единственный способ входа в аккаунт",
    }
  }

  await prisma.account.deleteMany({
    where: { userId: session.user.id, provider },
  })

  revalidatePath("/settings")
  return { success: true }
}