import { View, Text, Pressable, useCSSVariable } from "../tw";
import { ChevronRight } from "lucide-react-native";

export function SettingsLink({ icon: Icon, label, sublabel, onPress }: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  sublabel?: string;
  onPress?: () => void;
}) {
  const muted = useCSSVariable("--color-muted-foreground");

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-card p-4 rounded-2xl border border-border mb-2 active:bg-muted"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center mr-3">
          <Icon size={18} color={muted} />
        </View>
        <View>
          <Text className="font-semibold text-foreground">{label}</Text>
          {sublabel && <Text className="text-xs text-muted-foreground">{sublabel}</Text>}
        </View>
      </View>
      <ChevronRight size={18} color={muted} />
    </Pressable>
  );
}
