"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/apiClient";
import { useAdminToken } from "@/lib/api/useAdminToken";
import type { ModelVersion, ModelDetail } from "@/lib/types/model";

export function useModels() {
  const token = useAdminToken();

  return useQuery({
    queryKey: ["admin", "models", token],
    queryFn: () => apiGet<ModelVersion[]>("/admin/models", token),
    enabled: !!token,
  });
}

export function useModel(id: string) {
  const token = useAdminToken();

  return useQuery({
    queryKey: ["admin", "models", id, token],
    queryFn: () => apiGet<ModelDetail>(`/admin/models/${id}`, token),
    enabled: !!id && !!token,
  });
}

export function useDeployModel() {
  const token = useAdminToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetEnv }: { id: string; targetEnv: string }) =>
      apiPost<{ ok: boolean; newStatus: string }>(
        `/admin/models/${id}/deploy`,
        { targetEnv },
        token
      ),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "models"] });
      qc.invalidateQueries({ queryKey: ["admin", "models", id] });
    },
  });
}

export function useRollbackModel() {
  const token = useAdminToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ ok: boolean; rolledBackTo: string }>(
        `/admin/models/${id}/rollback`,
        {},
        token
      ),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "models"] });
      qc.invalidateQueries({ queryKey: ["admin", "models", id] });
    },
  });
}
