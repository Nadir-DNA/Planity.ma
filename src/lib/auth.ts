import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { db } from "./db";

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
  // No adapter — using JWT strategy with Credentials provider only.
  // PrismaAdapter will be added back if/when Google OAuth is configured.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
    newUser: "/inscription",
  },
  providers: [
    // Google provider will be added here when GOOGLE_CLIENT_ID/SECRET are configured
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