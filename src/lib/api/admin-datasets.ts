"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { DatasetVersion, DatasetRow } from "@/lib/types/dataset";

export interface DatasetRowsResponse {
  rows: DatasetRow[];
  total: number;
}

export interface BuildDatasetPayload {
  name: string;
  fromDate: string;
  toDate: string;
  includeOnlyAgreed: boolean;
}

export function useDatasets() {
  return useQuery({
    queryKey: ["admin", "datasets"],
    queryFn: () => apiGet<DatasetVersion[]>("/admin/datasets"),
  });
}

export function useDatasetRows(id: string, page = 1) {
  return useQuery({
    queryKey: ["admin", "datasets", id, "rows", page],
    queryFn: () =>
      apiGet<DatasetRowsResponse>(`/admin/datasets/${id}/rows?page=${page}`),
    enabled: !!id,
  });
}

export function useBuildDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BuildDatasetPayload) =>
      apiPost<{ ok: boolean; jobId: string }>("/admin/datasets/build", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "datasets"] });
    },
  });
}
