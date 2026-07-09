"use client";

import { useActiveFeatureFlags, usePostHog } from "posthog-js/react";
import {
  resolveFlag,
  getFlagDefault,
  FEATURE_FLAG_KEYS,
  type FeatureFlagKey,
  type ResolvedFlag,
} from "@aitutor/shared";

/**
 * Resolve a feature flag on the web using the shared precedence model:
 *   PostHog remote  >  registry default
 *
 * (There is no local-override layer on web — that is a mobile QA affordance.
 * The shared `resolveFlag` still drives the remote-vs-default decision so both
 * platforms agree on how a flag resolves.)
 *
 * `useActiveFeatureFlags()` subscribes the component to PostHog flag loads, so
 * the value updates once remote flags arrive (and on identify/reset).
 */
export function useResolvedFlag(key: FeatureFlagKey): ResolvedFlag {
  const posthog = usePostHog();
  // Subscribe to flag load/reload; the array itself is not used directly.
  useActiveFeatureFlags();

  const remote = posthog?.isFeatureEnabled(key);
  return resolveFlag(key, undefined, typeof remote === "boolean" ? remote : undefined);
}

/** Primary consumer API: is this feature enabled? */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  return useResolvedFlag(key).value;
}

/**
 * Resolve every flag at once. Useful for filtering lists of flag-gated items
 * (e.g. sidebar nav) without calling a hook per item.
 */
export function useFeatureFlags(): Record<FeatureFlagKey, boolean> {
  const posthog = usePostHog();
  useActiveFeatureFlags();

  const map = {} as Record<FeatureFlagKey, boolean>;
  for (const key of FEATURE_FLAG_KEYS) {
    const remote = posthog?.isFeatureEnabled(key);
    map[key] = resolveFlag(
      key,
      undefined,
      typeof remote === "boolean" ? remote : undefined,
    ).value;
  }
  return map;
}

/**
 * Non-hook resolver for server components / one-off checks where a live
 * PostHog client is not available. Falls back to the registry default.
 */
export function flagDefault(key: FeatureFlagKey): boolean {
  return getFlagDefault(key);
}
