"use client";

import { cn } from "@/lib/utils";
import type { Rubric, CriterionScore } from "@/lib/types/marking";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";

interface RubricChecklistProps {
  rubric: Rubric;
  perCriterion?: CriterionScore[];
  editable?: boolean;
  value?: Record<string, number>;
  onChange?: (criterionId: string, score: number) => void;
}

export function RubricChecklist({
  rubric,
  perCriterion = [],
  editable = false,
  value = {},
  onChange,
}: RubricChecklistProps) {
  const scoreMap = Object.fromEntries(perCriterion.map((c) => [c.criterionId, c]));

  return (
    <div className="space-y-4">
      {rubric.criteria.map((criterion) => {
        const ai = scoreMap[criterion.id];
        const overrideScore = value[criterion.id];
        const displayScore = overrideScore ?? ai?.score;
        const maxLevel = Math.max(...criterion.descriptors.map((d) => d.level));

        return (
          <div key={criterion.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{criterion.label}</p>
                <p className="text-xs text-muted-foreground">Weight: {criterion.weight}</p>
              </div>
              <div className="shrink-0 text-right">
                {editable ? (
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`score-${criterion.id}`} className="text-xs text-muted-foreground sr-only">
                      Score
                    </Label>
                    <Input
                      id={`score-${criterion.id}`}
                      type="number"
                      min={0}
                      max={maxLevel}
                      step={1}
                      value={overrideScore ?? ai?.score ?? ""}
                      onChange={(e) => onChange?.(criterion.id, Number(e.target.value))}
                      className="w-16 h-7 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">/ {maxLevel}</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold">
                    {displayScore != null ? `${displayScore} / ${maxLevel}` : "—"}
                  </span>
                )}
              </div>
            </div>

            {ai?.justification && (
              <p className="text-xs text-muted-foreground italic">AI: {ai.justification}</p>
            )}

            {/* Descriptor pills */}
            <div className="flex flex-wrap gap-1">
              {criterion.descriptors.map((d) => (
                <span
                  key={d.level}
                  className={cn(
                    "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] border",
                    ai?.level === d.level
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                  title={d.text}
                >
                  L{d.level}
                </span>
              ))}
            </div>

            {criterion.descriptors.find((d) => d.level === ai?.level) && (
              <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-2">
                {criterion.descriptors.find((d) => d.level === ai?.level)?.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
