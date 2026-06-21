"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * When the NextAuth jwt callback fails to refresh the backend access token it
 * flags the session with `error: "RefreshAccessTokenError"`. This guard watches
 * for that flag and force-signs-out, so an idle user whose refresh token has
 * expired/been revoked is bounced to login without having to make an API call
 * first. Renders nothing.
 */
export function SessionGuard() {
  const { data } = useSession();

  useEffect(() => {
    if ((data as any)?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/auth/login" });
    }
  }, [data]);

  return null;
}
