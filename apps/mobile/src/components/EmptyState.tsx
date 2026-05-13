import { View, Text, useCSSVariable } from "../tw";

export function EmptyState({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  description: string;
}) {
  const muted = useCSSVariable("--color-muted-foreground");

  return (
    <View className="flex-1 items-center justify-center p-12">
      <View className="bg-muted p-6 rounded-full mb-6">
        <Icon size={48} color={muted} />
      </View>
      <Text className="text-foreground text-xl font-bold mb-2">{title}</Text>
      <Text className="text-muted-foreground text-sm text-center">{description}</Text>
    </View>
  );
}
