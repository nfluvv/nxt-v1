"use server"

import { auth } from "@/auth"
import { prisma } from "@/shared/server/db/prisma"
import { verifyTonProof } from "@/shared/server/ton/verify-ton-proof"

type Result = { success: true } | { success: false; error: string }

export async function linkTonWallet(input: unknown): Promise<Result> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "unauthorized" }

  const address = await verifyTonProof(input)
  if (!address) return { success: false, error: "invalidProof" }

  const taken = await prisma.user.findUnique({
    where: { walletAddress: address },
    select: { id: true },
  })
  if (taken && taken.id !== session.user.id) {
    return { success: false, error: "walletAlreadyLinked" }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: address },
  })
  return { success: true }
}

export async function unlinkTonWallet(): Promise<Result> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "unauthorized" }

  const [user, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    }),
    prisma.account.count({ where: { userId: session.user.id } }),
  ])

  if (!user?.email && accounts === 0) {
    return { success: false, error: "lastLoginMethod" }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: null },
  })
  return { success: true }
}