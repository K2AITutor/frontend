# Feature Flags

A thin, typed layer over [PostHog](https://posthog.com) feature flags with
on-device developer overrides. Lets us ship dark launches, gradual rollouts, and
A/B tests for every major feature of the app — toggled remotely from the PostHog
dashboard, with no app release required.

## How a flag resolves

Every flag resolves with this precedence:

```
local override  >  PostHog remote value  >  registry default
```

- **local override** — a developer toggle stored in SecureStore (set from the
  in-app debug screen). Wins over everything. Great for QA/demos.
- **PostHog remote** — the value from the PostHog dashboard for the identified
  user (respects targeting / % rollouts). Requires `EXPO_PUBLIC_POSTHOG_KEY`.
- **registry default** — the `defaultValue` in `registry.ts`. Used when PostHog
  is disabled/offline or the flag hasn't been created yet, so the app always
  degrades gracefully.

The precedence logic lives in `resolve.ts` (a pure, unit-tested function).

## Using a flag

```tsx
import { useFeatureFlag } from "../lib/featureFlags";

const showTutor = useFeatureFlag("ai-photo-tutor");
```

Or declaratively:

```tsx
import { FeatureGate } from "../components/FeatureGate";

<FeatureGate flag="exams" fallback={<Unavailable />}>
  <ExamScreen />
</FeatureGate>
```

Flag keys are a TypeScript union — a typo like `"ai-photo-tuter"` fails to
compile.

## Adding a flag

1. Add an entry to `FEATURE_FLAGS` in `registry.ts` (key, description, default).
2. Gate the feature with `useFeatureFlag("your-key")` or `<FeatureGate>`.
3. Create a matching flag in the PostHog dashboard using the **same key** to
   control it remotely.

## Debug screen

In dev builds, **Profile → Feature Flags** opens a screen listing every flag,
its resolved value, and its source. Each flag can be forced **On** / **Off** or
set to **Inherit** (clear the override). Overrides persist in SecureStore.

## Files

The **registry and resolver are shared** across web and mobile (they live in
`@aitutor/shared`); the files below are the mobile-specific runtime.

| File | Responsibility |
|---|---|
| `@aitutor/shared` · `constants/featureFlags.ts` | Single source of truth: all flag keys + defaults (shared) |
| `@aitutor/shared` · `lib/featureFlags.ts` | Pure precedence resolver `resolveFlag` (shared) |
| `registry.ts` / `resolve.ts` | Thin re-exports of the shared registry/resolver (stable local import paths) |
| `overrides.ts` | SecureStore-backed local override store (mobile only) |
| `FeatureFlagProvider.tsx` | Context provider + `useFeatureFlag` / `useFeatureFlagAdmin` hooks |
| `../../components/FeatureGate.tsx` | Declarative gate component |
| `../../../app/settings/feature-flags.tsx` | Dev debug/override screen |

The provider is mounted in `app/_layout.tsx`. Users are identified to PostHog on
login (`app/login.tsx`) and reset on logout so per-user targeting works.

## Web

The web app (`apps/web`) consumes the **same shared registry and resolver** via
`@/lib/featureFlags` (`useFeatureFlag`, `<FeatureGate>`), backed by `posthog-js`.
There is no local-override layer on web — it resolves remote → default only.
Identity is kept in sync with the NextAuth session in
`apps/web/src/components/auth/SessionGuard.tsx`.
