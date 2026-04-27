"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/apiClient";

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
  return useQuery({
    queryKey: ["admin", "marking", "routing-config"],
    queryFn: () => apiGet<RoutingConfig>("/admin/marking/routing-config"),
  });
}

export function useUpdateRoutingConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: RoutingConfig) =>
      apiPut<RoutingConfig>("/admin/marking/routing-config", config),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "marking", "routing-config"] });
      qc.invalidateQueries({ queryKey: ["admin", "marking", "stats"] });
    },
  });
}

export function useConfidenceThresholds() {
  return useQuery({
    queryKey: ["admin", "marking", "confidence-thresholds"],
    queryFn: () => apiGet<ConfidenceThresholds>("/admin/marking/confidence-thresholds"),
  });
}

export function useUpdateConfidenceThresholds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (thresholds: ConfidenceThresholds) =>
      apiPut<ConfidenceThresholds>("/admin/marking/confidence-thresholds", thresholds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "marking", "confidence-thresholds"] });
      qc.invalidateQueries({ queryKey: ["admin", "marking", "stats"] });
    },
  });
}

export function useMarkingStats(range = "7d") {
  return useQuery({
    queryKey: ["admin", "marking", "stats", range],
    queryFn: () => apiGet<MarkingStats>(`/admin/marking/stats?range=${range}`),
  });
}

export function useAnnotations(
  filters: { teacherId?: string; dateRange?: string } = {}
) {
  const params = new URLSearchParams();
  if (filters.teacherId) params.set("teacherId", filters.teacherId);
  if (filters.dateRange) params.set("dateRange", filters.dateRange);
  const qs = params.toString();
  return useQuery({
    queryKey: ["admin", "annotations", filters],
    queryFn: () =>
      apiGet<Annotation[]>(`/admin/annotations${qs ? `?${qs}` : ""}`),
  });
}
