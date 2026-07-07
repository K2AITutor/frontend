/**
 * Central registry of every feature flag the app supports.
 *
 * This is the single source of truth. Each entry declares:
 *  - `description`: human-readable summary shown in the dev debug screen.
 *  - `defaultValue`: the value used when neither a local override nor a
 *    PostHog remote value is available (offline, PostHog disabled, or the
 *    flag not yet created in the dashboard). Keep defaults `true` for already
 *    shipped features so the app degrades gracefully.
 *
 * The PostHog flag key in the dashboard must match the key used here.
 */
export const FEATURE_FLAGS = {
  "ai-photo-tutor": {
    description: 'The "Scan Math Problem" AI photo tutor card on the Practice tab.',
    defaultValue: true,
  },
  "practice-sessions": {
    description: "Subject practice session flow (topic drills and sessions).",
    defaultValue: true,
  },
  exams: {
    description: "Exam attempt and review experience.",
    defaultValue: true,
  },
  "notifications-inbox": {
    description: "In-app notifications tab and inbox.",
    defaultValue: true,
  },
  "push-notifications": {
    description: "Device push-notification registration and prompts.",
    defaultValue: true,
  },
  subscriptions: {
    description: "Subscription / paywall screens.",
    defaultValue: true,
  },
  "in-app-purchases": {
    description: "Native in-app purchase (store) buy buttons.",
    defaultValue: true,
  },
  "biometric-unlock": {
    description: "Face ID / Touch ID / Android biometric quick unlock.",
    defaultValue: true,
  },
  "appearance-dark-mode": {
    description: "Appearance / theme (light-dark) settings.",
    defaultValue: true,
  },
  "account-deletion": {
    description: "Self-service account deletion flow.",
    defaultValue: true,
  },
  "dashboard-activity-feed": {
    description: "Recent activity feed on the home dashboard.",
    defaultValue: true,
  },
} as const;

/** Union of every valid flag key — misspellings fail to type-check. */
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/** All flag keys as an array (useful for the debug screen and reload logic). */
export const FEATURE_FLAG_KEYS = Object.keys(FEATURE_FLAGS) as FeatureFlagKey[];

/** Code-level default for a flag. */
export function getFlagDefault(key: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[key].defaultValue;
}
