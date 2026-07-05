import React from "react";
import { Text, TextInput, useCSSVariable, View } from "../../tw";
import { cn } from "../../lib/utils";

type TextInputProps = React.ComponentPropsWithoutRef<typeof TextInput>;

export interface InputProps extends TextInputProps {
  error?: string;
}

export const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, error, placeholderTextColor, ...props }, ref) => {
    const muted = useCSSVariable("--color-muted-foreground");

    return (
      <View>
        <TextInput
          ref={ref}
          placeholderTextColor={placeholderTextColor || muted}
          className={cn(
            "min-h-12 w-full rounded-xl border border-input bg-muted px-4 py-3 text-foreground",
            error && "border-destructive",
            className
          )}
          {...props}
        />
        {error && <Text className="mt-1 text-xs text-destructive">{error}</Text>}
      </View>
    );
  }
);
Input.displayName = "Input";
