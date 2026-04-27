"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { ModelVersion, ModelDetail } from "@/lib/types/model";

export function useModels() {
  return useQuery({
    queryKey: ["admin", "models"],
    queryFn: () => apiGet<ModelVersion[]>("/admin/models"),
  });
}

export function useModel(id: string) {
  return useQuery({
    queryKey: ["admin", "models", id],
    queryFn: () => apiGet<ModelDetail>(`/admin/models/${id}`),
    enabled: !!id,
  });
}

export function useDeployModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, targetEnv }: { id: string; targetEnv: string }) =>
      apiPost<{ ok: boolean; newStatus: string }>(
        `/admin/models/${id}/deploy`,
        { targetEnv }
      ),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "models"] });
      qc.invalidateQueries({ queryKey: ["admin", "models", id] });
    },
  });
}

export function useRollbackModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ ok: boolean; rolledBackTo: string }>(
        `/admin/models/${id}/rollback`,
        {}
      ),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "models"] });
      qc.invalidateQueries({ queryKey: ["admin", "models", id] });
    },
  });
}
