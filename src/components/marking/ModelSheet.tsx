"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/dashboard/ui/sheet";
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
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Separator } from "@/components/dashboard/ui/separator";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/dashboard/ui/sonner";
import { useModel, useDeployModel, useRollbackModel } from "@/lib/api/admin-models";
import { ModelDeploymentCard } from "@/components/marking/ModelDeploymentCard";

interface Props {
  modelId: string | null;
  onClose: () => void;
}

export function ModelSheet({ modelId, onClose }: Props) {
  return (
    <Sheet open={modelId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-2xl w-full flex flex-col p-0">
        {modelId && <SheetBody id={modelId} />}
      </SheetContent>
    </Sheet>
  );
}

function SheetBody({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useModel(id);
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

  return (
    <>
      <SheetHeader className="px-6 pt-6 pb-4 pr-12 border-b shrink-0">
        <SheetTitle>Model Detail</SheetTitle>
        <SheetDescription>
          Deployment status, eval metrics, and history.
        </SheetDescription>
      </SheetHeader>

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-10 gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load model details</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && (
          <>
            <ModelDeploymentCard
              model={data}
              onDeploy={() => setDeployDialog(true)}
              onRollback={() => setRollbackDialog(true)}
              busy={busy}
            />

            <Separator />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
                Eval Metrics
              </p>
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
                <p className="text-xs text-muted-foreground font-mono break-all pt-3 border-t mt-3">
                  {data.artifactUri}
                </p>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
                Deployment History
              </p>
              {data.deploymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deployment history.</p>
              ) : (
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
                        <TableCell className="font-mono text-xs">{entry.version}</TableCell>
                        <TableCell>{entry.deployedBy}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(entry.deployedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}
      </div>

      {data && (
        <>
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
        </>
      )}
    </>
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
