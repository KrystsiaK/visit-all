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
      const isAuthPage = nextUrl.pathname.startsWith('/login');
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
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
