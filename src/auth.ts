import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { prisma } from "@/shared/server/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { generateUniqueUsername } from "@/entities/user/lib/generate-username";
import { verifyTonProof } from "@/entities/wallet/api/generate-ton-message";

const TonCredentialsSchema = z.object({
  walletAddress: z.string().min(48),
  signature: z.string(),
  nonce: z.string(),
  timestamp: z.number(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          walletAddress: null,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          walletAddress: null,
        };
      },
    }),
    Credentials({
      id: "ton-wallet",
      name: "TON Wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        nonce: { label: "Nonce", type: "text" },
        timestamp: { label: "Timestamp", type: "number" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const parsed = TonCredentialsSchema.parse(credentials);
          
          await verifyTonProof(
            parsed.walletAddress,
            parsed.signature,
            parsed.nonce,
            parsed.timestamp
          );

          let user = await prisma.user.findUnique({
            where: { walletAddress: parsed.walletAddress },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress: parsed.walletAddress,
                username: await generateUniqueUsername(
                  parsed.walletAddress.slice(0, 10)
                ),
              },
            });
          } else if (!user.walletVerifiedAt) {
            await prisma.user.update({
              where: { id: user.id },
              data: { walletVerifiedAt: new Date() },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            walletAddress: user.walletAddress,
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("TON auth error:", error);
          return null;
        }
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      const seed =
        user.email?.split("@")[0] ??
        user.name ??
        (user.walletAddress ? user.walletAddress.slice(0, 10) : "web3_user");

      const username = await generateUniqueUsername(seed);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          username,
          ...(user.email && { emailVerified: new Date() }),
        },
      });
    },
  },
  callbacks: {
    // ... твои существующие callbacks...
    jwt: async ({ token, user, trigger }) => {
      if (user?.id) {
        token.id = user.id;
        token.role = (user.role as "USER" | "ADMIN") ?? "USER";
        token.walletAddress = user.walletAddress ?? null;
        token.username = user.username ?? null;
      }

      if (token.id && (user || trigger === "update")) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            name: true,
            image: true,
            walletAddress: true,
            username: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.walletAddress = dbUser.walletAddress;
          token.username = dbUser.username;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.name = token.name ?? null;
        session.user.image = token.picture ?? null;
        session.user.walletAddress = token.walletAddress as string | null;
        session.user.username = token.username as string | null;
      }
      return session;
    },
  },
});
