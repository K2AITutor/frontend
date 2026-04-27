"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { ReviewDecision } from "@/lib/types/review";
import type { SubmissionFull } from "@/lib/types/marking";
import type {
  TeacherStats,
  TeacherHistoryItem,
  ReviewQueueResponse,
} from "@/lib/types/teacher";

export function useTeacherStats() {
  return useQuery({
    queryKey: ["teacher", "stats"],
    queryFn: () => apiGet<TeacherStats>("/teacher/stats"),
  });
}

export interface ReviewQueueFilters {
  subject?: string;
  minConfidence?: number;
  maxConfidence?: number;
  reason?: string;
  page?: number;
}

export function useReviewQueue(filters: ReviewQueueFilters = {}) {
  const params = new URLSearchParams();
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.minConfidence != null) params.set("minConfidence", String(filters.minConfidence));
  if (filters.maxConfidence != null) params.set("maxConfidence", String(filters.maxConfidence));
  if (filters.reason) params.set("reason", filters.reason);
  if (filters.page != null) params.set("page", String(filters.page));
  const qs = params.toString();

  return useQuery({
    queryKey: ["teacher", "review-queue", filters],
    queryFn: () =>
      apiGet<ReviewQueueResponse>(`/teacher/review-queue${qs ? `?${qs}` : ""}`),
  });
}

export function useSubmissionFull(id: string) {
  return useQuery({
    queryKey: ["teacher", "submissions", id],
    queryFn: () => apiGet<SubmissionFull>(`/teacher/submissions/${id}`),
    enabled: !!id,
  });
}

export function useSubmitTeacherCorrection(submissionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (decision: ReviewDecision) =>
      apiPost<{ ok: boolean; submissionId: string; newStatus: string }>(
        `/teacher/submissions/${submissionId}/correct`,
        decision
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "review-queue"] });
      qc.invalidateQueries({ queryKey: ["teacher", "history"] });
      qc.invalidateQueries({ queryKey: ["teacher", "stats"] });
      qc.invalidateQueries({ queryKey: ["teacher", "submissions", submissionId] });
    },
  });
}

export function usePostTeacherLabels() {
  return useMutation({
    mutationFn: (payload: {
      submissionId: string;
      errorTags: string[];
      rubricNotes: string;
    }) => apiPost<{ ok: boolean; labelId: string }>("/teacher/labels", payload),
  });
}

export function useTeacherHistory(range: string = "7d") {
  return useQuery({
    queryKey: ["teacher", "history", range],
    queryFn: () =>
      apiGet<TeacherHistoryItem[]>(`/teacher/history?range=${range}`),
  });
}
