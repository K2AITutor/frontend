import React from "react";
import { type LucideIcon } from "lucide-react-native";
import { Pressable, SafeAreaView, Text, useCSSVariable, View } from "../tw";
import { cn } from "../lib/utils";

type SafeAreaViewProps = React.ComponentPropsWithoutRef<typeof SafeAreaView>;

export interface ScreenProps extends SafeAreaViewProps {
  padded?: boolean;
}

export function Screen({ className, children, padded = false, ...props }: ScreenProps) {
  return (
    <SafeAreaView className={cn("flex-1 bg-background", padded && "p-6", className)} {...props}>
      {children}
    </SafeAreaView>
  );
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: LucideIcon;
  onLeftPress?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  leftIcon: LeftIcon,
  onLeftPress,
  rightContent,
  className,
}: ScreenHeaderProps) {
  const primary = useCSSVariable("--color-primary");

  return (
    <View
      className={cn(
        "border-b border-border bg-card px-6 py-5 flex-row items-center justify-between",
        className
      )}
    >
      <View className="min-w-0 flex-1 flex-row items-center">
        {LeftIcon && (
          <Pressable
            onPress={onLeftPress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-primary/10 active:opacity-80"
          >
            <LeftIcon size={22} color={primary} />
          </Pressable>
        )}
        <View className="min-w-0 flex-1">
          <Text className="text-2xl font-bold text-foreground" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightContent}
    </View>
  );
}
