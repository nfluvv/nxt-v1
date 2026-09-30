"use server"

import { getTranslations } from "next-intl/server"

import { auth } from "@/auth"
import { prisma } from "@/shared/server/db/prisma"
import { createDeleteAccountSchema } from "@/entities/user"
import { checkRateLimit } from "@/shared/server/security/rate-limit"
import { getClientIp } from "@/shared/server/lib/get-client-ip"

type DeleteResult = { success: true } | { success: false; error: string }

export const deleteAccount = async (raw: unknown): Promise<DeleteResult> => {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const ip = await getClientIp()
  const allowed = await checkRateLimit(`delete-account:ip:${ip}`, {
    limit: 5,
    windowMs: 60_000,
  })
  if (!allowed) return { success: false, error: "Too many tries. Try later." }

  const t = await getTranslations("validation")
  const parsed = createDeleteAccountSchema(t).safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Incorrect data",
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })
  if (!user) return { success: false, error: "User not found" }

  await prisma.user.delete({ where: { id: session.user.id } })

  return { success: true }
}
