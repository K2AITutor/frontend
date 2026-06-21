import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { normalizeRole } from "@/lib/roleRouting";

const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE_SECONDS) || 3600; // 1 hour
const SESSION_REMEMBER_ME_MAX_AGE =
    Number(process.env.SESSION_REMEMBER_ME_MAX_AGE_SECONDS) || 604800; // 7 days

function getApiBase() {
    const apiBase =
        process.env.INTERNAL_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:4000/api";
    return apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`;
}

// Read the `exp` claim (seconds since epoch) from a JWT and return it as ms.
// Returns 0 if the token can't be decoded so callers treat it as expired.
function getAccessTokenExpiry(accessToken?: string): number {
    if (!accessToken) return 0;
    try {
        const payload = JSON.parse(
            Buffer.from(accessToken.split(".")[1], "base64").toString("utf8")
        );
        return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
    } catch {
        return 0;
    }
}

// Exchange the stored refresh token for a fresh access + refresh token pair.
// On failure, flag the token with an error so the client can force re-login.
async function refreshAccessToken(token: any): Promise<any> {
    try {
        if (!token.refreshToken) throw new Error("No refresh token");

        const res = await fetch(`${getApiBase()}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
        });

        if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);

        const data = await res.json();
        const accessToken = data.access_token;

        return {
            ...token,
            accessToken,
            // Backend rotates the refresh token; fall back to the old one if absent.
            refreshToken: data.refresh_token ?? token.refreshToken,
            accessTokenExpires: getAccessTokenExpiry(accessToken),
            error: undefined,
        };
    } catch {
        return { ...token, error: "RefreshAccessTokenError" };
    }
}

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
                rememberMe: { label: "Remember Me", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const rememberMe = credentials.rememberMe === "true";

                const base = getApiBase();

                const res = await fetch(`${base}/auth/signin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                        rememberMe,
                    }),
                });

                if (!res.ok) return null;

                const data = await res.json();

                return {
                    id: String(data.userId),
                    email: data.email,
                    name: data.email?.split("@")[0] || data.email,
                    role: normalizeRole(data.role),
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    // Read the real value from backend so the complete-profile flow
                    // works; default to true for older responses that omit it.
                    profileCompleted: data.profileCompleted ?? true,
                    rememberMe,
                };
            },
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
        maxAge: SESSION_REMEMBER_ME_MAX_AGE,
    },

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const base = getApiBase();

                    const res = await fetch(`${base}/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            idToken: account.id_token,
                        }),
                    });

                    if (!res.ok) return false;

                    const data = await res.json();

                    (user as any).id = String(data.userId);
                    (user as any).role = normalizeRole(data.role);
                    (user as any).accessToken = data.access_token;
                    (user as any).refreshToken = data.refresh_token;
                    (user as any).profileCompleted = data.profileCompleted;

                    return true;
                } catch {
                    return false;
                }
            }

            return true;
        },

        async jwt({ token, user, trigger, session }) {
            // Initial sign-in: seed the token from the authorize/signIn result.
            if (user) {
                token.id = (user as any).id;
                token.role = normalizeRole((user as any).role);
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refreshToken;
                token.accessTokenExpires = getAccessTokenExpiry((user as any).accessToken);
                token.profileCompleted = (user as any).profileCompleted;
                token.rememberMe = (user as any).rememberMe ?? false;
                return token;
            }

            if (trigger === "update" && session?.profileCompleted !== undefined) {
                token.profileCompleted = session.profileCompleted;
            }

            // Still valid (with a 60s safety margin) — reuse the current token.
            const expires = (token.accessTokenExpires as number) || 0;
            if (expires && Date.now() < expires - 60_000) {
                return token;
            }

            // Access token expired or about to — rotate via the refresh token.
            return refreshAccessToken(token);
        },

        async session({ session, token }) {
            (session.user as any).id = token.id;
            (session.user as any).role = normalizeRole(token.role);
            (session.user as any).accessToken = token.accessToken;
            (session.user as any).profileCompleted = token.profileCompleted;
            // Surface refresh failure so the client can force a re-login.
            (session as any).error = (token as any).error;
            return session;
        },
    },

    events: {
        // Revoke the refresh token in the backend when the user signs out so a
        // leaked refresh token can't be replayed after logout. Best-effort.
        async signOut({ token }) {
            try {
                const accessToken = (token as any)?.accessToken;
                if (!accessToken) return;
                await fetch(`${getApiBase()}/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            } catch {
                /* best-effort: cookie is cleared regardless */
            }
        },
    },

    pages: {
        signIn: "/auth/login",
    },
};
