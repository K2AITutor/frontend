"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { toast } from "@/components/dashboard/ui/sonner";
import { Loader2, AlertCircle, Save, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import {
  useConfidenceThresholds,
  useUpdateConfidenceThresholds,
  useMarkingStats,
  type ConfidenceThresholds,
} from "@/lib/api/admin-marking";
import { Slider } from "@/components/dashboard/ui/slider";

export default function AdminMarkingConfidencePage() {
  const { data, isLoading, error, refetch } = useConfidenceThresholds();
  const { data: stats, error: statsError } = useMarkingStats();
  const update = useUpdateConfidenceThresholds();

  const [thresholds, setThresholds] = useState<ConfidenceThresholds>({
    acceptAbove: 0.8,
    reviewBetween: [0.45, 0.8],
    rejectBelow: 0.45,
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data) {
      setThresholds(data);
      setDirty(false);
    }
  }, [data]);

  function setAcceptAbove(v: number) {
    setThresholds((prev) => {
      const acceptAbove = Math.max(v, prev.rejectBelow + 0.05);
      return { ...prev, acceptAbove, reviewBetween: [prev.rejectBelow, acceptAbove] };
    });
    setDirty(true);
  }

  function setRejectBelow(v: number) {
    setThresholds((prev) => {
      const rejectBelow = Math.min(v, prev.acceptAbove - 0.05);
      return { ...prev, rejectBelow, reviewBetween: [rejectBelow, prev.acceptAbove] };
    });
    setDirty(true);
  }

  function handleSave() {
    update.mutate(thresholds, {
      onSuccess: () => {
        toast.success("Confidence thresholds saved successfully");
        setDirty(false);
      },
      onError: () => {
        toast.error("Failed to save confidence thresholds");
      },
    });
  }

  function handleDiscard() {
    if (data) {
      setThresholds(data);
      setDirty(false);
    }
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load confidence thresholds</p>
        <Button variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );

  const simulated = stats?.simulatedImpact;
  const reviewWidth = Math.max(0, thresholds.acceptAbove - thresholds.rejectBelow);

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Confidence Thresholds</h1>
          <p className="text-muted-foreground">
            Tune when submissions are auto-accepted, sent for review, or rejected.
            Changes apply to all pending submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={!dirty || update.isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Discard
          </Button>
          <Button onClick={handleSave} disabled={!dirty || update.isPending}>
            {update.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Threshold Settings</CardTitle>
            <CardDescription>Drag sliders to adjust thresholds (0.00 – 1.00)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Zone bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.00</span>
                <span>1.00</span>
              </div>
              <div className="flex h-5 w-full overflow-hidden rounded-full" aria-hidden="true">
                <div
                  className="bg-red-400 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${thresholds.rejectBelow * 100}%` }}
                >
                  {thresholds.rejectBelow >= 0.1 && "Reject"}
                </div>
                <div
                  className="bg-yellow-400 flex items-center justify-center text-yellow-900 text-xs font-medium"
                  style={{ width: `${reviewWidth * 100}%` }}
                >
                  {reviewWidth >= 0.1 && "Review"}
                </div>
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(1 - thresholds.acceptAbove) * 100}%` }}
                >
                  {1 - thresholds.acceptAbove >= 0.1 && "Accept"}
                </div>
              </div>
              <p className="sr-only">
                Current zones: Reject below {thresholds.rejectBelow.toFixed(2)}, Review
                between {thresholds.rejectBelow.toFixed(2)} and{" "}
                {thresholds.acceptAbove.toFixed(2)}, Accept above{" "}
                {thresholds.acceptAbove.toFixed(2)}.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Auto-Accept Threshold</label>
                  <span className="text-sm font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {thresholds.acceptAbove.toFixed(2)}
                  </span>
                </div>
                <Slider
                  ariaLabel="Auto-Accept Threshold"
                  value={thresholds.acceptAbove}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={setAcceptAbove}
                />
                <p className="text-xs text-muted-foreground">
                  Submissions above this threshold are automatically accepted.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Auto-Reject Threshold</label>
                  <span className="text-sm font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    {thresholds.rejectBelow.toFixed(2)}
                  </span>
                </div>
                <Slider
                  ariaLabel="Auto-Reject Threshold"
                  value={thresholds.rejectBelow}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={setRejectBelow}
                />
                <p className="text-xs text-muted-foreground">
                  Submissions below this threshold are flagged for mandatory review.
                </p>
              </div>

              <div className="space-y-1 pt-1 border-t">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-muted-foreground">
                    Review Zone (derived)
                  </label>
                  <span className="text-sm font-mono bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    {thresholds.rejectBelow.toFixed(2)} – {thresholds.acceptAbove.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submissions in this range are queued for teacher review.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Saved Impact</CardTitle>
            <CardDescription>
              Projected effect of last saved settings · Save to update
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsError ? (
              <p className="text-sm text-red-500">Failed to load stats.</p>
            ) : simulated ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <StatImpact
                    label="Accept Rate"
                    current={simulated.currentAcceptRate}
                    projected={simulated.projectedAcceptRate}
                  />
                  <StatImpact
                    label="Escalation Rate"
                    current={simulated.currentEscalationRate}
                    projected={simulated.projectedEscalationRate}
                    invertDelta
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  * Projections based on last 7 days of submission data.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No stats available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatImpact({
  label,
  current,
  projected,
  invertDelta = false,
}: {
  label: string;
  current: number;
  projected: number;
  invertDelta?: boolean;
}) {
  const delta = projected - current;
  const isPositive = invertDelta ? delta < 0 : delta > 0;
  const TrendIcon = delta >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold">{projected}%</span>
        {delta !== 0 && (
          <div
            className={`flex items-center gap-0.5 text-sm pb-0.5 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            <span>
              {delta > 0 ? "+" : ""}
              {delta}%
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Current: {current}%</p>
    </div>
  );
}
