import * as SecureStore from "expo-secure-store";
import { FEATURE_FLAG_KEYS, type FeatureFlagKey } from "./registry";

/**
 * On-device developer overrides for feature flags, persisted in SecureStore.
 *
 * An override forces a flag on or off locally, taking precedence over the
 * PostHog remote value and the registry default. Removing an override lets the
 * flag fall back to remote/default again ("Inherit" in the debug screen).
 *
 * SecureStore keys allow alphanumerics plus `.`, `-`, `_`, so the hyphenated
 * flag keys are used directly with a namespacing prefix.
 */
const OVERRIDE_PREFIX = "ff_override_";

export type FlagOverrides = Partial<Record<FeatureFlagKey, boolean>>;

function storageKey(key: FeatureFlagKey): string {
  return `${OVERRIDE_PREFIX}${key}`;
}

/** Load every persisted override into a single map. */
export async function loadOverrides(): Promise<FlagOverrides> {
  const entries = await Promise.all(
    FEATURE_FLAG_KEYS.map(async (key) => {
      const raw = await SecureStore.getItemAsync(storageKey(key));
      if (raw === "true") return [key, true] as const;
      if (raw === "false") return [key, false] as const;
      return null;
    }),
  );

  const overrides: FlagOverrides = {};
  for (const entry of entries) {
    if (entry) overrides[entry[0]] = entry[1];
  }
  return overrides;
}

/** Set (`true`/`false`) or clear (`null`) a single flag override. */
export async function setOverride(key: FeatureFlagKey, value: boolean | null): Promise<void> {
  if (value === null) {
    await SecureStore.deleteItemAsync(storageKey(key));
    return;
  }
  await SecureStore.setItemAsync(storageKey(key), value ? "true" : "false");
}

/** Remove every override, restoring pure remote/default resolution. */
export async function clearOverrides(): Promise<void> {
  await Promise.all(
    FEATURE_FLAG_KEYS.map((key) => SecureStore.deleteItemAsync(storageKey(key))),
  );
}
