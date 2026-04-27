"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";

interface ScoreOverrideInputProps {
  aiScore: number;
  maxScore: number;
  value: number | "";
  onChange: (score: number | "") => void;
  className?: string;
}

export function ScoreOverrideInput({
  aiScore,
  maxScore,
  value,
  onChange,
  className,
}: ScoreOverrideInputProps) {
  const delta = value !== "" ? value - aiScore : null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium">Final Score</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={maxScore}
          step={1}
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange("");
            const n = Number(raw);
            if (!isNaN(n)) onChange(Math.min(maxScore, Math.max(0, n)));
          }}
          className="w-20 text-center text-lg font-semibold h-10"
          placeholder="—"
        />
        <span className="text-sm text-muted-foreground">/ {maxScore}</span>
        {delta !== null && delta !== 0 && (
          <span
            className={cn(
              "text-sm font-medium",
              delta > 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {delta > 0 ? `+${delta}` : delta} from AI
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        AI score: {aiScore} / {maxScore}
      </p>
    </div>
  );
}
