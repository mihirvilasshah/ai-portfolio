import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

// Define the login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Mock user database (replace with real database in production)
const mockUsers = [
  {
    id: "user-1",
    email: "demo@example.com",
    password: "demo123", // In production, this would be hashed
    name: "Demo User",
    image: null,
  },
  {
    id: "user-2",
    email: "investor@example.com",
    password: "invest123",
    name: "Test Investor",
    image: null,
  },
];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    // Credentials provider for email/password login
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          // Find user in mock database
          const user = mockUsers.find(
            (u) => u.email === email && u.password === password
          );

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
    // Google OAuth provider (requires env vars)
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/");
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      // Allow access to auth pages for unauthenticated users
      if (isAuthPage) {
        if (isLoggedIn) {
          // Redirect logged-in users away from auth pages
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // For dashboard pages, require authentication
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        // Redirect to login
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET ?? "development-secret-change-in-production",
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
