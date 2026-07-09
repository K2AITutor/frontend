import { View, Text } from "../tw";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <View className={`bg-muted animate-pulse rounded-2xl ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-card p-5 rounded-3xl border border-border mb-4">
      <View className="flex-row items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <View className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </View>
      </View>
      <Skeleton className="h-3.5 w-full rounded-full" />
    </View>
  );
}

export function SkeletonStats() {
  return (
    <View className="flex-row flex-wrap gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="bg-card p-4 rounded-3xl border border-border flex-1 min-w-[140px]">
          <Skeleton className="h-3 w-16 mb-3" />
          <Skeleton className="h-8 w-12" />
        </View>
      ))}
    </View>
  );
}
