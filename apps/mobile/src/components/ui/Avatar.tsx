import React from "react";
import { Image } from "react-native";
import { Text, View } from "../../tw";
import { cn } from "../../lib/utils";

type ViewProps = React.ComponentPropsWithoutRef<typeof View>;

export interface AvatarProps extends ViewProps {
  uri?: string | null;
  fallback?: string;
}

export function Avatar({ className, uri, fallback, ...props }: AvatarProps) {
  return (
    <View
      className={cn("h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      {uri ? (
        <Image source={{ uri }} style={{ height: "100%", width: "100%" }} resizeMode="cover" />
      ) : (
        <Text className="font-semibold text-muted-foreground">{fallback}</Text>
      )}
    </View>
  );
}
