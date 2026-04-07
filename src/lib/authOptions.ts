import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const apiBase =
                    process.env.INTERNAL_API_BASE_URL ||
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
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
                    profileCompleted: true,
                };
            },
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const apiBase =
                        process.env.INTERNAL_API_BASE_URL ||
                        process.env.NEXT_PUBLIC_API_BASE_URL ||
                        "http://localhost:4000/api";
                    const base = apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`;

                    const res = await fetch(`${base}/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            idToken: account.id_token,
                        }),
                    });

                    if (!res.ok) return false;

                    const data = await res.json();
                    // Attach backend data to user object for jwt callback
                    (user as any).id = String(data.userId);
                    (user as any).role = data.role;
                    (user as any).accessToken = data.access_token;
                    (user as any).profileCompleted = data.profileCompleted;

                    return true;
                } catch {
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role;
                token.accessToken = (user as any).accessToken;
                token.profileCompleted = (user as any).profileCompleted;
            }
            // Handle session.update() from client
            if (trigger === "update" && session?.profileCompleted !== undefined) {
                token.profileCompleted = session.profileCompleted;
            }
            return token;
        },

        async session({ session, token }) {
            (session.user as any).id = token.id;
            (session.user as any).role = token.role;
            (session.user as any).accessToken = token.accessToken;
            (session.user as any).profileCompleted = token.profileCompleted;
            return session;
        },
    },

    pages: {
        signIn: "/auth/login",
    },
};
