export type { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      locale: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    locale: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    locale: string;
  }
}
