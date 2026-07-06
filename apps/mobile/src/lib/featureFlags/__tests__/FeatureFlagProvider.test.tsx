import React from "react";
import { Text } from "react-native";
import { render, waitFor } from "@testing-library/react-native";

// --- Mock the PostHog singleton used by the provider ---
// Note: jest hoists jest.mock() above imports, so factory-referenced
// variables must be prefixed with `mock`.
const mockIsFeatureEnabled = jest.fn();
jest.mock("../../observability", () => ({
  posthog: {
    isFeatureEnabled: (key: string) => mockIsFeatureEnabled(key),
    onFeatureFlags: () => () => {},
    reloadFeatureFlagsAsync: () => Promise.resolve(undefined),
  },
}));

// --- Mock SecureStore with an in-memory store ---
const mockStore: Record<string, string> = {};
jest.mock("expo-secure-store", () => ({
  getItemAsync: (key: string) => Promise.resolve(mockStore[key] ?? null),
  setItemAsync: (key: string, value: string) => {
    mockStore[key] = value;
    return Promise.resolve();
  },
  deleteItemAsync: (key: string) => {
    delete mockStore[key];
    return Promise.resolve();
  },
}));

import { FeatureFlagProvider, useFeatureFlag } from "../FeatureFlagProvider";
import { FeatureGate } from "../../../components/FeatureGate";
import type { FeatureFlagKey } from "../registry";

function Probe({ flag }: { flag: FeatureFlagKey }) {
  const enabled = useFeatureFlag(flag);
  return <Text>{`${flag}:${enabled ? "on" : "off"}`}</Text>;
}

beforeEach(() => {
  for (const key of Object.keys(mockStore)) delete mockStore[key];
  mockIsFeatureEnabled.mockReset();
  mockIsFeatureEnabled.mockReturnValue(undefined);
});

describe("FeatureFlagProvider", () => {
  it("uses the registry default when there is no override or remote value", async () => {
    const screen = render(
      <FeatureFlagProvider>
        <Probe flag="ai-photo-tutor" />
      </FeatureFlagProvider>,
    );
    // ai-photo-tutor defaults to true.
    await waitFor(() => expect(screen.getByText("ai-photo-tutor:on")).toBeTruthy());
  });

  it("lets a local override win over the PostHog remote value", async () => {
    // Remote says enabled, but a stored override forces it off.
    mockIsFeatureEnabled.mockImplementation((key) => key === "ai-photo-tutor");
    mockStore["ff_override_ai-photo-tutor"] = "false";

    const screen = render(
      <FeatureFlagProvider>
        <Probe flag="ai-photo-tutor" />
      </FeatureFlagProvider>,
    );

    await waitFor(() => expect(screen.getByText("ai-photo-tutor:off")).toBeTruthy());
  });
});

describe("FeatureGate", () => {
  it("renders children when enabled and the fallback when disabled", async () => {
    mockStore["ff_override_exams"] = "false";

    const screen = render(
      <FeatureFlagProvider>
        <FeatureGate flag="exams" fallback={<Text>hidden</Text>}>
          <Text>shown</Text>
        </FeatureGate>
      </FeatureFlagProvider>,
    );

    await waitFor(() => expect(screen.getByText("hidden")).toBeTruthy());
    expect(screen.queryByText("shown")).toBeNull();
  });
});
