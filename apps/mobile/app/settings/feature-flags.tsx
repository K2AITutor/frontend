import React from "react";
import { SettingsScreen } from "../../src/components/SettingsScreen";
import { Button } from "../../src/components/ui";
import { Text, View, Pressable } from "../../src/tw";
import {
  FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
  useFeatureFlagAdmin,
  type FeatureFlagKey,
} from "../../src/lib/featureFlags";

type OverrideChoice = "inherit" | "on" | "off";

const CHOICES: { value: OverrideChoice; label: string; override: boolean | null }[] = [
  { value: "inherit", label: "Inherit", override: null },
  { value: "on", label: "On", override: true },
  { value: "off", label: "Off", override: false },
];

function sourceLabel(source: string): string {
  if (source === "override") return "Local override";
  if (source === "remote") return "PostHog";
  return "Default";
}

export default function FeatureFlagsScreen() {
  const { resolve, overrides, setOverride, clearOverrides, reloadRemote } =
    useFeatureFlagAdmin();

  return (
    <SettingsScreen title="Feature Flags" subtitle="Developer overrides (local only)">
      <View className="mb-6 flex-row gap-3">
        <Button label="Reload from remote" variant="outline" onPress={() => reloadRemote()} />
        <Button label="Reset all" variant="outline" onPress={() => clearOverrides()} />
      </View>

      {FEATURE_FLAG_KEYS.map((key: FeatureFlagKey) => {
        const resolved = resolve(key);
        const current = overrides[key];
        const selected: OverrideChoice =
          current === true ? "on" : current === false ? "off" : "inherit";

        return (
          <View key={key} className="mb-4 rounded-3xl border border-border bg-card p-5">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-base font-bold text-foreground">{key}</Text>
              <View
                className={`rounded-full px-2.5 py-1 ${resolved.value ? "bg-primary/15" : "bg-muted"}`}
              >
                <Text
                  className={`text-xs font-bold ${resolved.value ? "text-primary" : "text-muted-foreground"}`}
                >
                  {resolved.value ? "ENABLED" : "DISABLED"}
                </Text>
              </View>
            </View>

            <Text className="mb-1 text-xs text-muted-foreground">
              {FEATURE_FLAGS[key].description}
            </Text>
            <Text className="mb-4 text-[11px] text-muted-foreground">
              Source: {sourceLabel(resolved.source)}
            </Text>

            <View className="flex-row overflow-hidden rounded-2xl border border-border">
              {CHOICES.map((choice, index) => {
                const isSelected = selected === choice.value;
                return (
                  <Pressable
                    key={choice.value}
                    onPress={() => setOverride(key, choice.override)}
                    className={`flex-1 py-2.5 ${isSelected ? "bg-primary" : "bg-transparent active:bg-muted"} ${index > 0 ? "border-l border-border" : ""}`}
                  >
                    <Text
                      className={`text-center text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
                    >
                      {choice.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </SettingsScreen>
  );
}
