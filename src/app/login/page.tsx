import { redirect } from "next/navigation";

// Legacy path. Canonical login lives at /auth/login (next-auth pages.signIn).
// Nothing links here anymore; kept only to redirect any stale bookmarks/links.
export default function LoginLegacyRedirectPage() {
    redirect("/auth/login");
}
