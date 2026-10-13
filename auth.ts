import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        if (user.lockedUntil && user.lockedUntil > new Date()) return null;
        const match = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!match) {
          const failed = user.failedLoginCount + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: failed,
              lockedUntil: failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
            },
          });
          await prisma.activityLog.create({
            data: { action: "LOGIN_FAILED", actorId: user.id },
          });
          return null;
        }
        if (user.status !== "APPROVED") return null;
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null },
        });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          identityNo: user.identityNo,
          mustChangePassword: user.mustChangePassword,
          totpEnabled: user.totpEnabled,
          locale: user.locale,
        };
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.status !== "APPROVED") return "/login?error=NotRegistered";
      return true;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!user.id) return;
      if (account?.provider === "google") {
        await prisma.activityLog.create({ data: { action: "LOGIN", actorId: user.id } });
      }
    },
  },
});

export async function assertLoginRate(email: string, ip: string) {
  const result = rateLimit(`login:${ip}:${email.toLowerCase()}`, 8, 15 * 60 * 1000);
  return result.ok;
}
