import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Text, View } from "../../tw";
import { cn } from "../../lib/utils";

const badgeVariants = cva("self-start rounded-md px-2.5 py-1", {
  variants: {
    variant: {
      default: "bg-primary",
      secondary: "bg-secondary",
      destructive: "bg-destructive",
      outline: "border border-border bg-transparent",
      success: "bg-emerald-500/15",
      orange: "bg-orange-500/15",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const textVariants = cva("text-xs font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      success: "text-emerald-500",
      orange: "text-orange-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
type ViewProps = React.ComponentPropsWithoutRef<typeof View>;

export interface BadgeProps extends ViewProps {
  label?: string;
  variant?: BadgeVariant;
}

export function Badge({ className, label, children, variant = "default", ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn(textVariants({ variant }))}>{label || children}</Text>
    </View>
  );
}

export { badgeVariants };
