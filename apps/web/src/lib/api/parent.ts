"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/apiClient";
import type {
  ParentChild,
  ParentChildDetail,
  WeeklyReport,
  ParentReports,
  ParentAlert,
} from "@/lib/types/parent";

export function useParentChildren() {
  return useQuery({
    queryKey: ["parent", "children"],
    queryFn: () => apiGet<ParentChild[]>("/parent/children"),
  });
}

export function useParentChild(id: string) {
  return useQuery({
    queryKey: ["parent", "children", id],
    queryFn: () => apiGet<ParentChildDetail>(`/parent/children/${id}`),
    enabled: !!id,
  });
}

export function useParentWeeklyReport(id: string) {
  return useQuery({
    queryKey: ["parent", "children", id, "weekly-report"],
    queryFn: () => apiGet<WeeklyReport>(`/parent/children/${id}/weekly-report`),
    enabled: !!id,
  });
}

export function useParentReports(range: string = "4w") {
  return useQuery({
    queryKey: ["parent", "reports", range],
    queryFn: () => apiGet<ParentReports>(`/parent/reports?range=${range}`),
  });
}

export function useParentAlerts() {
  return useQuery({
    queryKey: ["parent", "alerts"],
    queryFn: () => apiGet<ParentAlert[]>("/parent/alerts"),
  });
}

export function useDismissParentAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ ok: boolean; id: string }>(`/parent/alerts/${id}/dismiss`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parent", "alerts"] });
      qc.invalidateQueries({ queryKey: ["parent", "children"] });
    },
  });
}
