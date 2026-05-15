"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/apiClient";
import { useAdminToken } from "@/lib/api/useAdminToken";

export interface RoutingRoute {
  subject: string;
  questionType: string;
  primary: string;
  fallback: string;
  confidenceFloor: number;
  escalateBelow: number;
}

export interface RoutingConfig {
  routes: RoutingRoute[];
}

export interface ConfidenceThresholds {
  acceptAbove: number;
  reviewBetween: [number, number];
  rejectBelow: number;
}

export interface RouteDistributionItem {
  route: string;
  pct: number;
}

export interface SimulatedImpact {
  currentAcceptRate: number;
  projectedAcceptRate: number;
  currentEscalationRate: number;
  projectedEscalationRate: number;
}

export interface MarkingStats {
  routeDistribution: RouteDistributionItem[];
  acceptRatePct: number;
  escalationRatePct: number;
  humanOverridePct: number;
  simulatedImpact: SimulatedImpact;
}

export interface Annotation {
  id: string;
  teacherId: string;
  teacherName: string;
  submissionId: string;
  createdAt: string;
  errorTags: string[];
  agreementWithModel: boolean;
}

export function useRoutingConfig() {
  const token = useAdminToken();

  return useQuery({
    queryKey: ["admin", "marking", "routing-config", token],
    queryFn: () => apiGet<RoutingConfig>("/admin/marking/routing-config", token),
    enabled: !!token,
  });
}

export function useUpdateRoutingConfig() {
  const token = useAdminToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (config: RoutingConfig) =>
      apiPut<RoutingConfig>("/admin/marking/routing-config", config, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "marking", "routing-config"] });
      qc.invalidateQueries({ queryKey: ["admin", "marking", "stats"] });
    },
  });
}

export function useConfidenceThresholds() {
  const token = useAdminToken();

  return useQuery({
    queryKey: ["admin", "marking", "confidence-thresholds", token],
    queryFn: () => apiGet<ConfidenceThresholds>("/admin/marking/confidence-thresholds", token),
    enabled: !!token,
  });
}

export function useUpdateConfidenceThresholds() {
  const token = useAdminToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (thresholds: ConfidenceThresholds) =>
      apiPut<ConfidenceThresholds>("/admin/marking/confidence-thresholds", thresholds, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "marking", "confidence-thresholds"] });
      qc.invalidateQueries({ queryKey: ["admin", "marking", "stats"] });
    },
  });
}

export function useMarkingStats(range = "7d") {
  const token = useAdminToken();

  return useQuery({
    queryKey: ["admin", "marking", "stats", range, token],
    queryFn: () => apiGet<MarkingStats>(`/admin/marking/stats?range=${range}`, token),
    enabled: !!token,
  });
}

export function useAnnotations(
  filters: { teacherId?: string; dateRange?: string } = {}
) {
  const token = useAdminToken();

  const params = new URLSearchParams();
  if (filters.teacherId) params.set("teacherId", filters.teacherId);
  if (filters.dateRange) params.set("dateRange", filters.dateRange);
  const qs = params.toString();
  return useQuery({
    queryKey: ["admin", "annotations", filters, token],
    queryFn: () =>
      apiGet<Annotation[]>(`/admin/annotations${qs ? `?${qs}` : ""}`, token),
    enabled: !!token,
  });
}
