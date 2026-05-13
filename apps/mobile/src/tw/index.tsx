import { useCssElement, useNativeVariable as useFunctionalVariable } from "react-native-css";
import { Link as RouterLink } from "expo-router";
import React from "react";
import { View as RNView, Text as RNText, Pressable as RNPressable, ScrollView as RNScrollView, TextInput as RNTextInput } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

export const View = React.forwardRef<RNView, React.ComponentPropsWithoutRef<typeof RNView> & { className?: string }>(
  (props, ref) => useCssElement(RNView, { ...props, ref }, { className: "style" })
);
View.displayName = "CSS(View)";

export const Text = React.forwardRef<RNText, React.ComponentPropsWithoutRef<typeof RNText> & { className?: string }>(
  (props, ref) => useCssElement(RNText, { ...props, ref }, { className: "style" })
);
Text.displayName = "CSS(Text)";

export const Pressable = React.forwardRef<React.ElementRef<typeof RNPressable>, React.ComponentPropsWithoutRef<typeof RNPressable> & { className?: string }>(
  (props, ref) => useCssElement(RNPressable, { ...props, ref }, { className: "style" })
);
Pressable.displayName = "CSS(Pressable)";

export const TextInput = React.forwardRef<RNTextInput, React.ComponentPropsWithoutRef<typeof RNTextInput> & { className?: string }>(
  (props, ref) => useCssElement(RNTextInput, { ...props, ref }, { className: "style" })
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
