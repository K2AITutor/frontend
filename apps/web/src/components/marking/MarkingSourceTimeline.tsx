import { cn } from "@/lib/utils";
import { HybridMarkingBadge } from "./HybridMarkingBadge";
import type { MarkingSourceResult, RoutingDecision } from "@/lib/types/marking";

interface MarkingSourceTimelineProps {
  sources: MarkingSourceResult[];
  routingDecision: RoutingDecision;
}

export function MarkingSourceTimeline({ sources, routingDecision }: MarkingSourceTimelineProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-muted-foreground">Chosen:</span>
        <HybridMarkingBadge source={routingDecision.chosenSource} size="sm" />
        <span className="text-xs text-muted-foreground">
          (threshold {(routingDecision.threshold * 100).toFixed(0)}% — {routingDecision.reason})
        </span>
      </div>

      <div className="space-y-2">
        {sources.map((src, i) => {
          const isChosen = src.source === routingDecision.chosenSource;
          const confPct = Math.round(src.confidence * 100);
          return (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-2.5 text-sm",
                isChosen ? "border-primary/50 bg-primary/5" : "border-border bg-muted/30"
              )}
            >
              <div className="shrink-0 pt-0.5">
                <HybridMarkingBadge source={src.source} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-medium">
                    Score: {src.score}
                  </span>
                  <span className="text-muted-foreground">
                    Confidence: {confPct}%
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {src.latencyMs}ms
                  </span>
                  {src.modelVersion && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {src.modelVersion}
                    </span>
                  )}
                  {src.ruleId && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {src.ruleId}
                    </span>
                  )}
                </div>
                {src.evidence && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate" title={src.evidence}>
                    {src.evidence}
                  </p>
                )}
              </div>
              {/* confidence mini-bar */}
              <div className="shrink-0 w-16 self-center">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      src.confidence >= 0.75
                        ? "bg-green-500"
                        : src.confidence >= 0.5
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${confPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
