"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { toast } from "@/components/dashboard/ui/sonner";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { useModel, useDeployModel, useRollbackModel } from "@/lib/api/admin-models";
import { ModelDeploymentCard } from "@/components/marking/ModelDeploymentCard";

export default function AdminModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useModel(id);
  const deploy = useDeployModel();
  const rollback = useRollbackModel();

  const [deployDialog, setDeployDialog] = useState(false);
  const [rollbackDialog, setRollbackDialog] = useState(false);

  const busy = deploy.isPending || rollback.isPending;

  function handleDeploy() {
    deploy.mutate(
      { id, targetEnv: "production" },
      {
        onSuccess: () => {
          toast.success("Model promoted to production");
          setDeployDialog(false);
        },
        onError: () => toast.error("Failed to promote model"),
      }
    );
  }

  function handleRollback() {
    rollback.mutate(id, {
      onSuccess: (res) => {
        toast.success(`Rolled back to ${res.rolledBackTo}`);
        setRollbackDialog(false);
      },
      onError: () => toast.error("Failed to rollback model"),
    });
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (error || !data)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Model not found</p>
        <Button variant="outline" asChild>
          <Link href="/admin/models">Back to Models</Link>
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/models">
            <ChevronLeft className="h-4 w-4" />
            Models
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ModelDeploymentCard
          model={data}
          onDeploy={() => setDeployDialog(true)}
          onRollback={() => setRollbackDialog(true)}
          busy={busy}
        />

        <Card>
          <CardHeader>
            <CardTitle>Eval Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MetricStat
                label="Precision"
                value={`${(data.evalMetrics.precision * 100).toFixed(1)}%`}
              />
              <MetricStat
                label="Recall"
                value={`${(data.evalMetrics.recall * 100).toFixed(1)}%`}
              />
              <MetricStat
                label="F1 Score"
                value={`${(data.evalMetrics.f1 * 100).toFixed(1)}%`}
              />
              <MetricStat
                label="MSE"
                value={
                  data.evalMetrics.mse != null
                    ? data.evalMetrics.mse.toFixed(3)
                    : "N/A"
                }
              />
            </div>
            {data.artifactUri && (
              <p className="text-xs text-muted-foreground font-mono break-all pt-2 border-t">
                {data.artifactUri}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Environment</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Deployed By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.deploymentHistory.map((entry, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge
                      variant={entry.env === "production" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {entry.env}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.version}
                  </TableCell>
                  <TableCell>{entry.deployedBy}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(entry.deployedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={deployDialog} onOpenChange={setDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Production</DialogTitle>
            <DialogDescription>
              Deploy{" "}
              <strong>
                {data.name} ({data.version})
              </strong>{" "}
              to the production environment. This action will affect live marking. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeployDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeploy} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Promote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rollbackDialog} onOpenChange={setRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rollback Model</DialogTitle>
            <DialogDescription>
              Roll back <strong>{data.name}</strong> from production. The model will be
              archived and the previous version restored. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRollback} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
