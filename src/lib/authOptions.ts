import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Dev Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // 🚀 DEV BYPASS — accept any email/password
                if (!credentials?.email) return null;

                return {
                    id: "dev-user-id",
                    email: credentials.email,
                    name: credentials.email.split("@")[0], // ✅ add this
                    role: "student",
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
            }
            return token;
        },

        async session({ session, token }) {
            (session.user as any).id = token.id;
            (session.user as any).role = token.role;
            return session;
        },
    },
};
