// The pure resolver now lives in the shared package so web and mobile share
// one resolution model. Re-exported here to keep existing import paths stable.
export { resolveFlag, type FlagSource, type ResolvedFlag } from "@aitutor/shared";
