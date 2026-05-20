import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number; // 0-1
  thresholds?: { accept: number; review: number };
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceMeter({
  value,
  thresholds = { accept: 0.75, review: 0.5 },
  showLabel = true,
  className,
}: ConfidenceMeterProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)));

  const barColor =
    value >= thresholds.accept
      ? "bg-green-500"
      : value >= thresholds.review
      ? "bg-yellow-500"
      : "bg-red-500";

  const levelLabel =
    value >= thresholds.accept ? "High" : value >= thresholds.review ? "Medium" : "Low";

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Confidence — {levelLabel}</span>
          <span className="font-medium tabular-nums">{pct}%</span>
        </div>
      )}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
        {/* zone marker: review threshold */}
        <div
          className="absolute inset-y-0 w-px bg-foreground/30 z-10"
          style={{ left: `${thresholds.review * 100}%` }}
        />
        {/* zone marker: accept threshold */}
        <div
          className="absolute inset-y-0 w-px bg-foreground/30 z-10"
          style={{ left: `${thresholds.accept * 100}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-[10px] text-muted-foreground/70 tabular-nums">
          <span>0%</span>
          <span style={{ marginLeft: `${thresholds.review * 100 - 5}%` }}>
            {Math.round(thresholds.review * 100)}%
          </span>
          <span>{Math.round(thresholds.accept * 100)}%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
}
