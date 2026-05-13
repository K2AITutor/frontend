import React from "react";
import { Pressable, Text, View } from "../../tw";
import { cn } from "../../lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

export interface TabsProps<T extends string> {
  value: T;
  items: TabItem<T>[];
  onValueChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ value, items, onValueChange, className }: TabsProps<T>) {
  return (
    <View className={cn("flex-row rounded-xl bg-muted p-1", className)}>
      {items.map((item) => {
        const active = item.value === value;

        return (
          <Pressable
            key={item.value}
            onPress={() => onValueChange(item.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={cn("flex-1 rounded-lg px-3 py-2", active && "bg-card")}
          >
            <Text
              className={cn(
                "text-center text-sm font-medium text-muted-foreground",
                active && "text-foreground"
              )}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
