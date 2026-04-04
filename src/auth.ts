import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
import { authenticateUserWithPassword } from "@/lib/auth/users";
import { normalizeEmail } from "@/lib/auth/passwords";
import { authDebug } from "@/lib/auth/debug";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password", placeholder: "••••••••••••" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = normalizeEmail(String(credentials.email));
        authDebug("login.attempt", { email: normalizedEmail });

        const clientIp = getClientIp(request);

        await assertRateLimit({
          scope: "auth_login",
          identifier: `${normalizedEmail}|${clientIp}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
          blockMs: 30 * 60 * 1000,
        });

        const result = await authenticateUserWithPassword(normalizedEmail, String(credentials.password));

        if (!result.ok) {
          authDebug("login.rejected", { email: normalizedEmail, code: result.code });
          if (result.code === "email_not_verified") {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          if (result.code === "inactive_user") {
            throw new Error("ACCOUNT_DISABLED");
          }

          return null;
        }

        authDebug("login.success", { email: normalizedEmail, userId: result.user.id });
        return result.user;
      }
    })
  ]
});
