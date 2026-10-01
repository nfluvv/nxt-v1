import { prisma } from "@/shared/server/db/prisma";
import { generateUniqueUsername } from "@/entities/user/lib/generate-username";

export async function findOrCreateUserByWallet(address: string) {
  const existing = await prisma.user.findUnique({ where: { walletAddress: address } });
  if (existing) return existing;

  const username = await generateUniqueUsername(address.slice(2, 10));
  return prisma.user.create({ data: { walletAddress: address, username } });
}