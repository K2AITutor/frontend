import React from "react";
import { View, Text } from "../../tw";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

export function PracticeOptionCard({
  title,
  description,
  badge,
  highlightText,
  features,
  buttonLabel,
  buttonVariant = "default",
  onPress,
}: {
  title: string;
  description: string;
  badge?: string;
  highlightText?: string;
  features: string[];
  buttonLabel: string;
  buttonVariant?: any;
  onPress: () => void;
}) {
  return (
    <Card className="mb-6 bg-white/5 border-white/10">
      <CardContent className="p-6">
        {badge && (
          <Badge variant="success" label={badge} className="mb-4 self-start" />
        )}
        <Text className="text-2xl font-bold text-white mb-2">{title}</Text>
        {highlightText && (
          <Text className="text-emerald-400 font-bold mb-3">{highlightText}</Text>
        )}
        <Text className="text-slate-300 leading-6 mb-6">{description}</Text>

        <View className="bg-slate-950/40 rounded-2xl p-4 mb-6 border border-white/5">
          <Text className="text-white font-bold mb-3 text-sm">What you get</Text>
          {features.map((f, i) => (
            <Text key={i} className="text-slate-400 text-xs mb-1.5">• {f}</Text>
          ))}
        </View>

        <Button
          variant={buttonVariant}
          label={buttonLabel}
          onPress={onPress}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}
