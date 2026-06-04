import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, type ColorSchemeName } from "react-native";
import * as SecureStore from "expo-secure-store";
import { colorScheme as cssColorScheme } from "react-native-css";

type ThemePreference = "system" | "light" | "dark";

interface ThemeContextValue {
  colorScheme: NonNullable<ColorSchemeName>;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

const THEME_KEY = "theme_preference";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(preference: ThemePreference, systemScheme: ColorSchemeName) {
  if (preference === "system") return systemScheme || "dark";
  return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let mounted = true;

    SecureStore.getItemAsync(THEME_KEY).then((stored) => {
      if (!mounted) return;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState(stored);
      }
    });

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const setPreference = useCallback(async (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    await SecureStore.setItemAsync(THEME_KEY, nextPreference);
  }, []);

  const colorScheme = resolveScheme(preference, systemScheme);

  useEffect(() => {
    const activeScheme = preference === "system" ? (systemScheme || "dark") : preference;
    cssColorScheme.set(activeScheme);
    Appearance.setColorScheme(preference === "system" ? null : preference);
  }, [preference, systemScheme]);

  const value = useMemo(
    () => ({ colorScheme, preference, setPreference }),
    [colorScheme, preference, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useThemePreference must be used within ThemeProvider");
  }
  return value;
}
