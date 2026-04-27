"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { Loader2, AlertCircle, ExternalLink, Cpu } from "lucide-react";
import { useModels } from "@/lib/api/admin-models";
import type { ModelFamily, DeploymentStatus } from "@/lib/types/model";

const STATUS_VARIANT: Record<
  DeploymentStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  production: "default",
  staging: "secondary",
  archived: "outline",
  retired: "destructive",
};

const FAMILY_LABEL: Record<ModelFamily, string> = {
  rule: "Rule Engine",
  llm: "LLM",
  ml: "Machine Learning",
};

const FAMILY_ORDER: ModelFamily[] = ["rule", "llm", "ml"];

export default function AdminModelsPage() {
  const { data, isLoading, error } = useModels();

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
        <p className="text-muted-foreground">Failed to load models</p>
      </div>
    );

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Model Registry</h1>
        <p className="text-muted-foreground">
          Manage marking model versions and deployments.
        </p>
      </div>

      {FAMILY_ORDER.map((family) => {
        const models = (data ?? []).filter((m) => m.family === family);
        if (models.length === 0) return null;
        return (
          <Card key={family}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4" />
                {FAMILY_LABEL[family]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Teacher Agreement</TableHead>
                    <TableHead>Deployed</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {model.version}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANT[model.status]}
                          className="capitalize"
                        >
                          {model.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{model.accuracyPct}%</TableCell>
                      <TableCell>{model.agreementWithTeacherPct}%</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {model.deployedAt
                          ? new Date(model.deployedAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/models/${model.id}`}>
                            <ExternalLink className="mr-1 h-3.5 w-3.5" />
                            Detail
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
