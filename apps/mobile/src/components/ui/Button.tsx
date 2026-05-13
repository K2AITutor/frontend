import React from "react";
import { ActivityIndicator } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { Pressable, Text } from "../../tw";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md active:opacity-80 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "min-h-11 px-4 py-2",
        sm: "min-h-9 px-3 py-1.5",
        lg: "min-h-12 px-8 py-3",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const labelVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-base",
      icon: "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type PressableProps = React.ComponentPropsWithoutRef<typeof Pressable>;

export interface ButtonProps
  extends Omit<PressableProps, "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  label?: string;
  loading?: boolean;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, children, label, loading, disabled, accessibilityLabel, ...props }, ref) => {
    const labelText = label || (typeof children === "string" ? children : undefined);

    return (
      <Pressable
        ref={ref}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || labelText}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && <ActivityIndicator size="small" />}
        {label ? <Text className={cn(labelVariants({ variant, size }))}>{label}</Text> : null}
        {children}
      </Pressable>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
