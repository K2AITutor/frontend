"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { ReviewDecision } from "@/lib/types/review";
import type { SubmissionFull } from "@/lib/types/marking";
import type {
  TeacherStats,
  TeacherHistoryItem,
  TeacherHistoryDetail,
  ReviewQueueResponse,
} from "@/lib/types/teacher";

export function useTeacherStats(options?: { refetchInterval?: number }) {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;

  const query = useQuery({
    queryKey: ["teacher", "stats", accessToken],
    queryFn: () => apiGet<TeacherStats>("/teacher/stats", accessToken),
    enabled: !!accessToken,
    ...options,
  });
  // Keep loading until the session token resolves (query stays disabled until
  // then), so reloads show a skeleton instead of a flash of error/empty state.
  return { ...query, isLoading: query.isPending };
}

export interface ReviewQueueFilters {
  subject?: string;
  minConfidence?: number;
  maxConfidence?: number;
  reason?: string;
  page?: number;
}

export function useReviewQueue(filters: ReviewQueueFilters = {}) {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;

  const params = new URLSearchParams();
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.minConfidence != null) params.set("minConfidence", String(filters.minConfidence));
  if (filters.maxConfidence != null) params.set("maxConfidence", String(filters.maxConfidence));
  if (filters.reason) params.set("reason", filters.reason);
  if (filters.page != null) params.set("page", String(filters.page));
  const qs = params.toString();

  const query = useQuery({
    queryKey: ["teacher", "review-queue", filters, accessToken],
    queryFn: () =>
      apiGet<ReviewQueueResponse>(
        `/teacher/review-queue${qs ? `?${qs}` : ""}`,
        accessToken
      ),
    enabled: !!accessToken,
  });
  // See useTeacherStats: keep loading until the session token resolves.
  return { ...query, isLoading: query.isPending };
}

export function useSubmissionFull(id: string) {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;

  const query = useQuery({
    queryKey: ["teacher", "submissions", id, accessToken],
    queryFn: () => apiGet<SubmissionFull>(`/teacher/submissions/${id}`, accessToken),
    enabled: !!id && !!accessToken,
  });
  // See useTeacherStats: keep loading until id + session token resolve.
  return { ...query, isLoading: query.isPending };
}

export function useSubmitTeacherCorrection(submissionId: string) {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (decision: ReviewDecision) =>
      apiPost<{ ok: boolean; submissionId: string; newStatus: string }>(
        `/teacher/submissions/${submissionId}/correct`,
        decision,
        accessToken
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
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;

  return useMutation({
    mutationFn: (payload: {
      submissionId: string;
      errorTags: string[];
      rubricNotes: string;
    }) => apiPost<{ ok: boolean; labelId: string }>("/teacher/labels", payload, accessToken),
  });
}

export function useTeacherHistory(range: string = "7d", options?: { refetchInterval?: number }) {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;

  const query = useQuery({
    queryKey: ["teacher", "history", range, accessToken],
    queryFn: () =>
      apiGet<TeacherHistoryItem[]>(`/teacher/history?range=${range}`, accessToken),
    enabled: !!accessToken,
    ...options,
  });
  // See useTeacherStats: keep loading until the session token resolves.
  return { ...query, isLoading: query.isPending };
}

export function useTeacherHistoryDetail(submissionId: string | null) {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;

  const query = useQuery({
    queryKey: ["teacher", "history-detail", submissionId, accessToken],
    queryFn: () =>
      apiGet<TeacherHistoryDetail>(`/teacher/history/${submissionId}`, accessToken),
    enabled: !!submissionId && !!accessToken,
  });
  // See useTeacherStats: keep loading until submissionId + session token resolve.
  return { ...query, isLoading: query.isPending };
}
