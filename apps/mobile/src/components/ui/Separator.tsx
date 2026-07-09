import React from "react";
import { View } from "../../tw";
import { cn } from "../../lib/utils";

type ViewProps = React.ComponentPropsWithoutRef<typeof View>;

export interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <View
      accessibilityRole="none"
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        "bg-border",
        className
      )}
      {...props}
    />
  );
}
