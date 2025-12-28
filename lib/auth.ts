// Auth.js configuration (NextAuth replacement)
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authApi } from "./api";
import type { LoginCredentials } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const token = await authApi.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (token?.access_token) {
            // Return user info with token - we'll use email as identifier
            // The actual user data might need to be fetched separately
            return {
              id: credentials.email, // Temporary - will be replaced with actual user ID
              email: credentials.email as string,
              name: credentials.email as string,
              token: token.access_token,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).token = token.token;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRET_KEY,
});
