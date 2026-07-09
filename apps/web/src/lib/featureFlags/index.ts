export {
  useFeatureFlag,
  useFeatureFlags,
  useResolvedFlag,
  flagDefault,
} from "./useFeatureFlag";
export { FeatureGate } from "./FeatureGate";
// Registry + resolver types come from the shared package — re-exported here so
// web feature-flag consumers have a single import site.
export {
  FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
  getFlagDefault,
  type FeatureFlagKey,
  type FlagSource,
  type ResolvedFlag,
} from "@aitutor/shared";
