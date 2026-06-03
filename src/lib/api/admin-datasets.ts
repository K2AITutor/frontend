"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/apiClient";
import { useAdminToken } from "@/lib/api/useAdminToken";
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

export type SplitFilter = "all" | "train" | "val" | "test";

export function useDatasets() {
  const token = useAdminToken();

  return useQuery({
    queryKey: ["admin", "datasets", token],
    queryFn: async () => {
      const list = await apiGet<DatasetVersion[]>("/admin/datasets", token);
      // Backend serializes the Prisma enum in upper-case (e.g. "READY"),
      // but the frontend compares against lower-case statuses. Normalize here
      // so status-dependent UI (Browse button, badge variant) works.
      return list.map((d) => ({
        ...d,
        status: String(d.status).toLowerCase() as DatasetVersion["status"],
      }));
    },
    enabled: !!token,
    // Poll every 5 s while any dataset is still building
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === "building") ? 5000 : false,
  });
}

export function useDatasetRows(id: string, page = 1, split: SplitFilter = "all") {
  const token = useAdminToken();

  return useQuery({
    queryKey: ["admin", "datasets", id, "rows", page, split, token],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (split !== "all") params.set("split", split);
      return apiGet<DatasetRowsResponse>(`/admin/datasets/${id}/rows?${params}`, token);
    },
    enabled: !!id && !!token,
  });
}

export function useBuildDataset() {
  const token = useAdminToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: BuildDatasetPayload) =>
      apiPost<{ ok: boolean; jobId: string }>("/admin/datasets/build", payload, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "datasets"] });
    },
  });
}
