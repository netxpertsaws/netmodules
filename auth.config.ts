import type { NextAuthConfig } from "next-auth";
import type { AppRole, AppStatus } from "@/lib/access-policy";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const record = user as {
          id: string;
          role?: AppRole;
          status?: AppStatus;
          identityNo?: string | null;
          mustChangePassword?: boolean;
          totpEnabled?: boolean;
          locale?: string;
        };
        token.id = record.id;
        token.role = record.role;
        token.status = record.status;
        token.identityNo = record.identityNo ?? null;
        token.mustChangePassword = record.mustChangePassword ?? false;
        token.totpEnabled = record.totpEnabled ?? false;
        token.locale = record.locale ?? "en";
        token.loginAt = Math.floor(Date.now() / 1000);
      }
      if (trigger === "update" && session && typeof session === "object") {
        const patch = session as { locale?: string };
        if (patch.locale === "en" || patch.locale === "ta") token.locale = patch.locale;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.id ?? "");
      session.user.role = (token.role as AppRole) ?? "MEMBER";
      session.user.status = (token.status as AppStatus) ?? "PENDING";
      session.user.identityNo = (token.identityNo as string | null) ?? null;
      session.user.mustChangePassword = Boolean(token.mustChangePassword);
      session.user.totpEnabled = Boolean(token.totpEnabled);
      session.user.locale = String(token.locale ?? "en");
      session.user.loginAt = typeof token.loginAt === "number" ? token.loginAt : null;
      return session;
    },
  },
} satisfies NextAuthConfig;
