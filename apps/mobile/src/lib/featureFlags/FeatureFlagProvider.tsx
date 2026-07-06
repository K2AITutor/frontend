import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { posthog } from "../observability";
import { FEATURE_FLAG_KEYS, type FeatureFlagKey } from "./registry";
import { resolveFlag, type ResolvedFlag } from "./resolve";
import {
  clearOverrides,
  loadOverrides,
  setOverride,
  type FlagOverrides,
} from "./overrides";

type RemoteFlags = Partial<Record<FeatureFlagKey, boolean>>;

interface FeatureFlagContextValue {
  /** Resolved boolean value for a flag (override > remote > default). */
  isEnabled: (key: FeatureFlagKey) => boolean;
  /** Resolved value plus where it came from — used by the debug screen. */
  resolve: (key: FeatureFlagKey) => ResolvedFlag;
  /** Current on-device overrides. */
  overrides: FlagOverrides;
  /** Latest remote (PostHog) values known for our registered flags. */
  remoteFlags: RemoteFlags;
  /** Force a flag on/off locally, or pass `null` to clear the override. */
  setOverride: (key: FeatureFlagKey, value: boolean | null) => Promise<void>;
  /** Remove every local override. */
  clearOverrides: () => Promise<void>;
  /** Re-fetch flags from PostHog. */
  reloadRemote: () => Promise<void>;
  /** True once overrides have loaded from storage. */
  ready: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

/** Read the currently-known PostHog value for each registered flag. */
function readRemoteFlags(): RemoteFlags {
  const next: RemoteFlags = {};
  for (const key of FEATURE_FLAG_KEYS) {
    try {
      const value = posthog.isFeatureEnabled(key);
      if (typeof value === "boolean") next[key] = value;
    } catch {
      // PostHog disabled or flags not loaded — leave undefined so the flag
      // falls back to its registry default.
    }
  }
  return next;
}

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverridesState] = useState<FlagOverrides>({});
  const [remoteFlags, setRemoteFlags] = useState<RemoteFlags>(() => readRemoteFlags());
  const [ready, setReady] = useState(false);

  // Load persisted overrides once on mount.
  useEffect(() => {
    let mounted = true;
    loadOverrides()
      .then((loaded) => {
        if (mounted) setOverridesState(loaded);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to PostHog flag loads/reloads and kick off an initial fetch.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = posthog.onFeatureFlags(() => setRemoteFlags(readRemoteFlags()));
      posthog.reloadFeatureFlagsAsync?.().catch(() => undefined);
    } catch {
      // PostHog unavailable/disabled — remote stays empty, defaults apply.
    }
    return () => unsubscribe?.();
  }, []);

  const handleSetOverride = useCallback(async (key: FeatureFlagKey, value: boolean | null) => {
    await setOverride(key, value);
    setOverridesState((prev) => {
      const next = { ...prev };
      if (value === null) delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  const handleClearOverrides = useCallback(async () => {
    await clearOverrides();
    setOverridesState({});
  }, []);

  const reloadRemote = useCallback(async () => {
    try {
      await posthog.reloadFeatureFlagsAsync?.();
    } catch {
      // ignore — resolution falls back to defaults
    }
    setRemoteFlags(readRemoteFlags());
  }, []);

  const value = useMemo<FeatureFlagContextValue>(() => {
    const resolve = (key: FeatureFlagKey) =>
      resolveFlag(key, overrides[key], remoteFlags[key]);
    return {
      isEnabled: (key) => resolve(key).value,
      resolve,
      overrides,
      remoteFlags,
      setOverride: handleSetOverride,
      clearOverrides: handleClearOverrides,
      reloadRemote,
      ready,
    };
  }, [overrides, remoteFlags, handleSetOverride, handleClearOverrides, reloadRemote, ready]);

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

function useFeatureFlagContext(): FeatureFlagContextValue {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) {
    throw new Error("useFeatureFlag must be used within a FeatureFlagProvider");
  }
  return ctx;
}

/** Primary consumer API: is this feature enabled? */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  return useFeatureFlagContext().isEnabled(key);
}

/** Full context for tooling (the dev debug screen). */
export function useFeatureFlagAdmin(): FeatureFlagContextValue {
  return useFeatureFlagContext();
}
