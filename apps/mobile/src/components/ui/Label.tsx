import React from "react";
import { Text } from "../../tw";
import { cn } from "../../lib/utils";

type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const Label = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} className={cn("mb-2 text-sm font-medium text-foreground", className)} {...props} />
  )
);
Label.displayName = "Label";
