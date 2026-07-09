import React from "react";
import { View } from "../../tw";
import { cn } from "../../lib/utils";

type ViewProps = React.ComponentPropsWithoutRef<typeof View>;

export function Skeleton({ className, ...props }: ViewProps) {
  return <View className={cn("rounded-md bg-muted opacity-70", className)} {...props} />;
}
