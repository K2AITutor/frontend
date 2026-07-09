"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { useAdminToken } from "@/lib/api/useAdminToken";
import type { DatasetCandidatesResponse } from "@/lib/types/dataset";

export type CandidateStatusFilter =
  | "CANDIDATE"
  | "VALIDATED"
  | "REJECTED"
  | "PROMOTED"
  | "all";

export function useDatasetCandidates(page: number, status: CandidateStatusFilter) {
  const token = useAdminToken();

  return useQuery({
    queryKey: ["admin", "dataset-candidates", page, status, token],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), status });
      return apiGet<DatasetCandidatesResponse>(
        `/admin/dataset-candidates?${params}`,
        token,
      );
    },
    enabled: !!token,
    // Keep the previous page visible while the next one loads to avoid layout jumps.
    placeholderData: (prev) => prev,
  });
}

export interface ValidateCandidatePayload {
  status: "VALIDATED" | "REJECTED";
  // Only meaningful when status === "VALIDATED".
  source?: "OWNER_REVIEW" | "EXPERT_REVIEW";
  trainingReadiness?: string;
  reviewerName?: string;
  // Only meaningful when status === "REJECTED".
  rejectionReason?: string;
}

export function useValidateDatasetCandidate() {
  const token = useAdminToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ValidateCandidatePayload }) =>
      apiPatch<unknown>(`/admin/dataset-candidates/${id}/validate`, payload, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "dataset-candidates"] });
    },
  });
}
