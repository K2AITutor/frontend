"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePostHog } from "posthog-js/react";

/**
 * When the NextAuth jwt callback fails to refresh the backend access token it
 * flags the session with `error: "RefreshAccessTokenError"`. This guard watches
 * for that flag and force-signs-out, so an idle user whose refresh token has
 * expired/been revoked is bounced to login without having to make an API call
 * first.
 *
 * It also keeps PostHog identity in sync with the session so feature-flag
 * targeting / percentage rollouts apply to the logged-in user. Renders nothing.
 */
export function SessionGuard() {
  const { data, status } = useSession();
  const posthog = usePostHog();
  const identifiedId = useRef<string | null>(null);

  useEffect(() => {
    if ((data as any)?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/auth/login" });
    }
  }, [data]);

  useEffect(() => {
    if (!posthog) return;

    const userId = (data?.user as any)?.id as string | undefined;

    if (status === "authenticated" && userId && identifiedId.current !== userId) {
      // Identify so PostHog resolves flags for this user (targeting/rollouts).
      posthog.identify(userId, { email: data?.user?.email ?? undefined });
      posthog.reloadFeatureFlags();
      identifiedId.current = userId;
    } else if (status === "unauthenticated" && identifiedId.current) {
      // Clear identity on logout so flags fall back to anonymous resolution.
      posthog.reset();
      identifiedId.current = null;
    }
  }, [posthog, status, data]);

  return null;
}
