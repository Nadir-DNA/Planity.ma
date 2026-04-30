import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import * as bcrypt from "bcryptjs";
import { db } from "./db";

// Conditional adapter: only use PrismaAdapter when OAuth providers are configured
// PrismaAdapter is needed for OAuth (Google) but causes issues with Credentials-only setup
const hasOAuthProviders = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// PrismaAdapter type assertion - needed for NextAuth v5 compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = hasOAuthProviders ? (PrismaAdapter(db) as any) : undefined;

// Extend NextAuth types - v5 style
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CONSUMER" | "PRO_OWNER" | "PRO_STAFF" | "ADMIN";
      locale: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(adapter ? { adapter } : {}),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
    newUser: "/inscription",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          locale: user.locale,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Cast user to access custom properties
        const u = user as unknown as { role?: string; locale?: string };
        token.role = u.role ?? "CLIENT";
        token.locale = u.locale ?? "FR";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token as unknown as { role?: string }).role as "CONSUMER" | "PRO_OWNER" | "PRO_STAFF" | "ADMIN";
        session.user.locale = (token as unknown as { locale?: string }).locale as string;
      }
      return session;
    },
  },
});
