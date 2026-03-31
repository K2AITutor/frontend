import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const apiBase =
                    process.env.INTERNAL_API_BASE ||
                    process.env.NEXT_PUBLIC_API_BASE ||
                    "http://localhost:4000/api";
                const base = apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`;

                const res = await fetch(`${base}/auth/signin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                });

                if (!res.ok) return null;

                const data = await res.json();

                return {
                    id: String(data.userId),
                    email: data.email,
                    name: data.email.split("@")[0],
                    role: data.role,
                    accessToken: data.access_token,
                };
            },
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role;
                token.accessToken = (user as any).accessToken;
            }
            return token;
        },

        async session({ session, token }) {
            (session.user as any).id = token.id;
            (session.user as any).role = token.role;
            (session.user as any).accessToken = token.accessToken;
            return session;
        },
    },
};
