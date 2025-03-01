import prisma from "@repo/db";
import { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if merchant exists
        let dbUser = await prisma.merchant.findUnique({
          where: { email: user.email },
        });

        // If merchant doesn't exist, create one with only the required fields
        if (!dbUser) {
          dbUser = await prisma.merchant.create({
            data: {
              id: user.id,
              email: user.email,
              name: user.name || "New Merchant",
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Instead of using getServerSession here, which creates a circular dependency,
      // use the NextAuth built-in methods to check user status
      if (url.startsWith(baseUrl)) {
        // We'll handle the redirect logic in a middleware or page component
        // where we can safely call getServerSession with authOptions
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};