"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Loader2, Rocket, RotateCcw } from "lucide-react";
import type { ModelDetail, DeploymentStatus } from "@/lib/types/model";

const STATUS_VARIANT: Record<
  DeploymentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  production: "default",
  staging: "secondary",
  archived: "outline",
  retired: "destructive",
};

interface Props {
  model: ModelDetail;
  onDeploy: () => void;
  onRollback: () => void;
  busy?: boolean;
}

export function ModelDeploymentCard({ model, onDeploy, onRollback, busy }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{model.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Version: <span className="font-mono">{model.version}</span>
          </p>
        </div>
        <Badge
          variant={STATUS_VARIANT[model.status] ?? "outline"}
          className="capitalize"
        >
          {model.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Accuracy</p>
            <p className="font-semibold text-lg">{model.accuracyPct}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Teacher Agreement</p>
            <p className="font-semibold text-lg">{model.agreementWithTeacherPct}%</p>
          </div>
        </div>
        {model.deployedAt && (
          <p className="text-xs text-muted-foreground">
            Deployed: {new Date(model.deployedAt).toLocaleDateString()}
          </p>
        )}
        <div className="flex gap-2">
          {model.status === "staging" && (
            <Button size="sm" onClick={onDeploy} disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}
              Promote to Production
            </Button>
          )}
          {model.status === "production" && (
            <Button size="sm" variant="outline" onClick={onRollback} disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Rollback
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
