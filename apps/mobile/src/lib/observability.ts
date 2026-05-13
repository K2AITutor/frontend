import * as Sentry from "@sentry/react-native";
import { PostHog } from "posthog-react-native";

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY || "", {
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  disabled: !process.env.EXPO_PUBLIC_POSTHOG_KEY,
});

export function initObservability() {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
    tracesSampleRate: 0.2,
  });
}

export function captureException(error: unknown) {
  Sentry.captureException(error);
}

export function captureEvent(name: string, properties?: Record<string, unknown>) {
  posthog.capture(name, properties as any);
}
