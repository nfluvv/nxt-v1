import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { prisma } from "@/shared/server/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { generateUniqueUsername } from "@/entities/user/lib/generate-username";
import { verifyTonProof } from "@/shared/server/ton/verify-ton-proof";
import { findOrCreateUserByWallet } from "@/entities/user/api/find-or-create-by-wallet";

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
      id: "ton",
      credentials: {},
      async authorize(raw) {
        const address = await verifyTonProof(raw);
        if (!address) return null;
        const user = await findOrCreateUserByWallet(address);
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      const seed =
        user.email?.split("@")[0] ??
        user.name ??
        (user.walletAddress ? user.walletAddress.slice(2, 10) : "web3_user");
      
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
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const session = await auth();
        
        if (session?.user?.id) {
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            select: { userId: true },
          });

          if (existingAccount && existingAccount.userId !== session.user.id) {
            return `/login?error=AccountAlreadyLinked`;
          }

          await prisma.account.create({
            data: {
              userId: session.user.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token ?? null,
              access_token: account.access_token ?? null,
              expires_at: account.expires_at ?? null,
              token_type: account.token_type ?? null,
              scope: account.scope ?? null,
              id_token: account.id_token ?? null,
              session_state: account.session_state ? String(account.session_state) : null,
            },
          });

          if (profile) {
            const updateData: Record<string, string> = {};
            if ("email" in profile && profile.email) updateData.email = String(profile.email);
            if ("image" in profile && profile.image) updateData.image = String(profile.image);

            if (Object.keys(updateData).length > 0) {
              await prisma.user.update({
                where: { id: session.user.id },
                data: updateData,
              });
            }
          }

          return true;
        }
      }
      return true;
    },

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