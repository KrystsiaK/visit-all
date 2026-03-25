import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@visitall.com" },
        password: { label: "Password", type: "password", placeholder: "demo" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = String(credentials.email).trim().toLowerCase();
        const clientIp = getClientIp(request);

        await assertRateLimit({
          scope: "auth_login",
          identifier: `${normalizedEmail}|${clientIp}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
          blockMs: 30 * 60 * 1000,
        });
        
        // MVP Demo Bypass: Guarantee absolute entry
        if (normalizedEmail === 'demo@visitall.com' && credentials.password === 'demo') {
           return { id: '11111111-1111-1111-1111-111111111111', email: 'demo@visitall.com' };
        }

        const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [normalizedEmail]);
        let user = rows[0];

        if (!user) {
           const hash = await bcrypt.hash(credentials.password as string, 10);
           const result = await pool.query(
             `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email`,
             [normalizedEmail, hash]
           );
           user = result.rows[0];
        } else {
           const isValid = await bcrypt.compare(credentials.password as string, user.password);
           if (!isValid) return null;
        }
        
        return { id: user.id, email: user.email };
      }
    })
  ]
});
