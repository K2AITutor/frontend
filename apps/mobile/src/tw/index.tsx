import { useCssElement, useNativeVariable as useFunctionalVariable } from "react-native-css";
import { Link as RouterLink } from "expo-router";
import React from "react";
import { View as RNView, Text as RNText, Pressable as RNPressable, ScrollView as RNScrollView, TextInput as RNTextInput, StyleSheet } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

// Helper to clean up buggy styles parsed from web CSS defaults
function sanitizeStyle(style: any): any {
  if (!style) return style;

  // Flatten the style completely into a single plain object (resolves arrays and registered stylesheet IDs)
  const flatStyle = StyleSheet.flatten(style);
  if (!flatStyle) return style;

  const newStyle = { ...flatStyle };

  // 1. Fix unitless line-height scaling bugs (e.g. 1.2, 1.5 converted to 1.2px, 1.5px)
  if (typeof newStyle.lineHeight === "number" && newStyle.lineHeight < 8) {
    delete newStyle.lineHeight;
  }
  if (typeof newStyle.lineHeight === "string") {
    const parsed = parseFloat(newStyle.lineHeight);
    if (!isNaN(parsed) && parsed < 8) {
      delete newStyle.lineHeight;
    }
  }

  // 2. Prevent descender clipping (cut-off bottom of letters like g, j, p, q, y)
  // If line-height is too close to or smaller than font-size, let the OS handle it naturally.
  if (
    typeof newStyle.lineHeight === "number" &&
    typeof newStyle.fontSize === "number" &&
    newStyle.lineHeight < newStyle.fontSize * 1.15
  ) {
    delete newStyle.lineHeight;
  }

  // 3. Fix quote-wrapping font-family resolution issues in React Native
  if (typeof newStyle.fontFamily === "string") {
    newStyle.fontFamily = newStyle.fontFamily.replace(/['"]/g, "").trim();
  }

  return newStyle;
}

const RNTextWrapper = React.forwardRef<RNText, React.ComponentPropsWithoutRef<typeof RNText>>(
  ({ style, ...props }, ref) => {
    return <RNText ref={ref} style={sanitizeStyle(style)} {...props} />;
  }
);
RNTextWrapper.displayName = "RNTextWrapper";

const RNTextInputWrapper = React.forwardRef<RNTextInput, React.ComponentPropsWithoutRef<typeof RNTextInput>>(
  ({ style, ...props }, ref) => {
    return <RNTextInput ref={ref} style={sanitizeStyle(style)} {...props} />;
  }
);
RNTextInputWrapper.displayName = "RNTextInputWrapper";

export const View = React.forwardRef<RNView, React.ComponentPropsWithoutRef<typeof RNView> & { className?: string }>(
  (props, ref) => useCssElement(RNView, { ...props, ref }, { className: "style" })
);
View.displayName = "CSS(View)";

export const Text = React.forwardRef<RNText, React.ComponentPropsWithoutRef<typeof RNText> & { className?: string }>(
  (props, ref) => useCssElement(RNTextWrapper, { ...props, ref }, { className: "style" })
);
Text.displayName = "CSS(Text)";

export const Pressable = React.forwardRef<React.ElementRef<typeof RNPressable>, React.ComponentPropsWithoutRef<typeof RNPressable> & { className?: string }>(
  (props, ref) => useCssElement(RNPressable, { ...props, ref }, { className: "style" })
);
Pressable.displayName = "CSS(Pressable)";

export const TextInput = React.forwardRef<RNTextInput, React.ComponentPropsWithoutRef<typeof RNTextInput> & { className?: string }>(
  (props, ref) => useCssElement(RNTextInputWrapper, { ...props, ref }, { className: "style" })
);
TextInput.displayName = "CSS(TextInput)";

export const ScrollView = React.forwardRef<RNScrollView, React.ComponentPropsWithoutRef<typeof RNScrollView> & { className?: string; contentContainerClassName?: string }>(
  (props, ref) => useCssElement(RNScrollView, { ...props, ref }, { className: "style", contentContainerClassName: "contentContainerStyle" })
);
ScrollView.displayName = "CSS(ScrollView)";

export const SafeAreaView = React.forwardRef<
  React.ElementRef<typeof RNSafeAreaView>,
  React.ComponentPropsWithoutRef<typeof RNSafeAreaView> & { className?: string }
>((props, ref) => useCssElement(RNSafeAreaView, { ...props, ref }, { className: "style" }));
SafeAreaView.displayName = "CSS(SafeAreaView)";

export const Link = React.forwardRef<React.ElementRef<typeof RouterLink>, React.ComponentPropsWithoutRef<typeof RouterLink> & { className?: string }>(
  (props, ref) => useCssElement(RouterLink, { ...props, ref }, { className: "style" })
);
Link.displayName = "CSS(Link)";

export const useCSSVariable = process.env.EXPO_OS !== "web"
  ? useFunctionalVariable
  : (variable: string) => `var(${variable})`;
