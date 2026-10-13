import type { DefaultSession } from "next-auth";
import type { AppRole, AppStatus } from "@/lib/access-policy";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      status: AppStatus;
      identityNo: string | null;
      mustChangePassword: boolean;
      totpEnabled: boolean;
      locale: string;
      loginAt: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: AppRole;
    status?: AppStatus;
    identityNo?: string | null;
    mustChangePassword?: boolean;
    totpEnabled?: boolean;
    locale?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    status?: AppStatus;
    identityNo?: string | null;
    mustChangePassword?: boolean;
    totpEnabled?: boolean;
    locale?: string;
    loginAt?: number;
  }
}
