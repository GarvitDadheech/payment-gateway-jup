import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@repo/db";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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
        // Check if user exists
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { merchant: true },
        });

        // If user doesn't exist, create one
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            include: { merchant: true },
          });
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Check if the user has completed onboarding
      if (url.startsWith(baseUrl)) {
        const session = await getServerSession();
        if (session?.user?.email) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { merchant: true },
          });

          // If user exists but hasn't completed onboarding, redirect to onboarding
          if (user && !user.merchant) {
            return `${baseUrl}/onboarding`;
          }
          
          // If user has completed onboarding, redirect to dashboard
          if (user && user.merchant) {
            return `${baseUrl}/dashboard`;
          }
        }
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
});

export { handler as GET, handler as POST };

async function getServerSession() {
  const authOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
  };
  
  return await NextAuth(authOptions).auth();
} 