import type { NextAuthConfig, Session } from "next-auth";
import { getAuthSecret } from "@/lib/security";

type SessionUserWithId = NonNullable<Session["user"]> & {
  id?: string;
};

export const authConfig = {
  secret: getAuthSecret(),
  providers: [], // Empty providers for edge compliance
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isGuestOnlyPage =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/register');
      const isPublicAuthUtilityPage =
        nextUrl.pathname.startsWith('/verify-email') ||
        nextUrl.pathname.startsWith('/forgot-password') ||
        nextUrl.pathname.startsWith('/reset-password');

      if (isGuestOnlyPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      if (isPublicAuthUtilityPage) {
        return true;
      }

      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) { token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as SessionUserWithId).id = token.id as string;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;
