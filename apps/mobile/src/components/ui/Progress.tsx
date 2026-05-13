import React from "react";
import type { DimensionValue } from "react-native";
import { View } from "../../tw";
import { cn } from "../../lib/utils";

type ViewProps = React.ComponentPropsWithoutRef<typeof View>;

export interface ProgressProps extends ViewProps {
  value?: number | null;
  max?: number;
}

export function Progress({ className, value = 0, max = 100, ...props }: ProgressProps) {
  const bounded = Math.max(0, Math.min(Number(value || 0), max));
  const width = (max > 0 ? `${(bounded / max) * 100}%` : "0%") as DimensionValue;

  return (
    <View
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: bounded }}
      {...props}
    >
      <View className="h-full rounded-full bg-primary" style={{ width }} />
    </View>
  );
}
