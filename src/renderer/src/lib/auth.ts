import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";

// Define the session type
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

// Define the auth options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is a simplified auth for demonstration
        // In a real app, you would check against a database
        if (
          credentials?.email === "testuser@example.com" &&
          credentials?.password === "securepass123"
        ) {
          return {
            id: "1",
            name: "Test User",
            email: "testuser@example.com",
            role: "admin",
          };
        }
        
        // If you want to allow the test credentials mentioned in the feedback
        if (
          credentials?.email === "testuser" &&
          credentials?.password === "securepass123"
        ) {
          return {
            id: "2",
            name: "Test User",
            email: "testuser@example.com",
            role: "user",
          };
        }
        
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

// Helper function to get the session on the server
export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}