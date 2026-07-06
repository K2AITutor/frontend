import { type FeatureFlagKey, getFlagDefault } from "./registry";

/** Where a resolved flag value came from — surfaced in the debug screen. */
export type FlagSource = "override" | "remote" | "default";

export interface ResolvedFlag {
  value: boolean;
  source: FlagSource;
}

/**
 * Resolve a single flag using the precedence:
 *   local override  >  PostHog remote  >  registry default
 *
 * Pure and side-effect free so it can be unit-tested in isolation.
 *
 * @param key     the flag being resolved (used for its code-level default)
 * @param override local on-device override, or `undefined` if none is set
 * @param remote   PostHog's remote value, or `undefined` if not loaded/unknown
 */
export function resolveFlag(
  key: FeatureFlagKey,
  override?: boolean,
  remote?: boolean,
): ResolvedFlag {
  if (typeof override === "boolean") {
    return { value: override, source: "override" };
  }
  if (typeof remote === "boolean") {
    return { value: remote, source: "remote" };
  }
  return { value: getFlagDefault(key), source: "default" };
}
