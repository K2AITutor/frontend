"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { Badge } from "@/components/dashboard/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/dashboard/ui/tooltip";
import { toast } from "@/components/dashboard/ui/sonner";
import {
  Loader2,
  AlertCircle,
  Save,
  Network,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import {
  useRoutingConfig,
  useUpdateRoutingConfig,
  useMarkingStats,
  type RoutingRoute,
} from "@/lib/api/admin-marking";
import { RoutingDistributionChart } from "@/components/marking/RoutingDistributionChart";

const SOURCES = ["rule", "llm", "ml", "human"];

function isRouteInvalid(route: RoutingRoute) {
  return route.escalateBelow > route.confidenceFloor;
}

export default function AdminMarkingRoutingPage() {
  const { data, isLoading, error } = useRoutingConfig();
  const { data: stats } = useMarkingStats();
  const update = useUpdateRoutingConfig();

  const [routes, setRoutes] = useState<RoutingRoute[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data) {
      setRoutes(data.routes);
      setDirty(false);
    }
  }, [data]);

  function updateRoute(
    index: number,
    field: keyof RoutingRoute,
    value: string | number
  ) {
    setRoutes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirty(true);
  }

  function handleSave() {
    update.mutate(
      { routes },
      {
        onSuccess: () => {
          toast.success("Routing config saved successfully");
          setDirty(false);
        },
        onError: () => {
          toast.error("Failed to save routing config");
        },
      }
    );
  }

  function handleDiscard() {
    if (data) {
      setRoutes(data.routes);
      setDirty(false);
    }
  }

  const hasErrors = routes.some(isRouteInvalid);

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
        <p className="text-muted-foreground">Failed to load routing config</p>
      </div>
    );

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marking Routing Config</h1>
          <p className="text-muted-foreground">
            Configure which marking engine handles each question type.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={!dirty || update.isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Discard Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={!dirty || hasErrors || update.isPending}
          >
            {update.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {hasErrors && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            One or more routes have <strong>Escalate Below</strong> greater than
            their <strong>Confidence Floor</strong>. Fix these before saving.
          </span>
        </div>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="h-4 w-4" />
              Route Distribution (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoutingDistributionChart data={stats.routeDistribution} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <TooltipProvider delayDuration={200}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Question Type</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Fallback</TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Confidence Floor
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Confidence Floor info"
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          Minimum confidence (0–1) for the Primary engine&apos;s
                          result to be accepted. Below this, the Fallback engine
                          runs.
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Escalate Below
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Escalate Below info"
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          Confidence threshold (0–1) below which the submission
                          is escalated to a human marker. Should be ≤ Confidence
                          Floor.
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route, i) => {
                  const invalid = isRouteInvalid(route);
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant="outline">{route.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{route.questionType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={route.primary}
                          onValueChange={(v) => updateRoute(i, "primary", v)}
                        >
                          <SelectTrigger className="w-28 uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SOURCES.map((s) => (
                              <SelectItem key={s} value={s} className="uppercase">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={route.fallback}
                          onValueChange={(v) => updateRoute(i, "fallback", v)}
                        >
                          <SelectTrigger className="w-28 uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SOURCES.map((s) => (
                              <SelectItem key={s} value={s} className="uppercase">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.01}
                          value={route.confidenceFloor}
                          onChange={(e) =>
                            updateRoute(
                              i,
                              "confidenceFloor",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`w-24 ${invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          aria-invalid={invalid}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.01}
                          value={route.escalateBelow}
                          onChange={(e) =>
                            updateRoute(
                              i,
                              "escalateBelow",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`w-24 ${invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          aria-invalid={invalid}
                        />
                        {invalid && (
                          <p className="mt-1 text-xs text-red-600">
                            Must be ≤ Confidence Floor
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
