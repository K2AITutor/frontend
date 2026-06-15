"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import type { SubmissionFull } from "@/lib/types/marking";

export type StudentSubmissionResponse = SubmissionFull & { humanReviewPending: boolean };

export function useStudentSubmission(id: string) {
  return useQuery({
    queryKey: ["student", "submissions", id],
    queryFn: () => apiGet<StudentSubmissionResponse>(`/student/submissions/${id}`),
    enabled: !!id,
  });
}

/* =========================================================
   SUBMISSIONS LIST (Phase 3) — student submission history
   Contract: _workspace/01_architect_spec.md §2a/§2b/§5
   Endpoint: GET /api/student/submissions (JwtAuthGuard)
   Response is an OBJECT wrapper { items, page, pageSize, total, totalPages },
   NOT a bare array. The hook consumer reads `data.items` for the table.
   userId comes from the Bearer token (apiClient) — never sent from client.
   ========================================================= */

export type SubmissionStatus =
  | "pending_review"
  | "reviewed"
  | "approved"
  | "overridden"
  | "escalated";

export interface SubmissionScore {
  awarded: number; // attempt.score ?? 0
  max: number; // attempt.maxScore ?? question.marks ?? 1
  percent: number | null; // max>0 ? round(awarded/max*100) : null
}

export interface StudentSubmissionListItem {
  id: string; // String(attempt.id) — opens /student/submissions/[id]
  title: string; // question.title || truncate(questionText, 80)
  subjectCode: string; // "MATH_METHODS" (UPPERCASE)
  subjectSlug: string; // "math-methods" (kebab) — FE filter + link
  subjectName: string; // "Maths Methods" (display; fallback = subjectCode)
  score: SubmissionScore;
  status: SubmissionStatus;
  submittedAt: string; // ISO string, attempt.createdAt
}

export interface StudentSubmissionsListResponse {
  items: StudentSubmissionListItem[]; // sorted submittedAt DESC (newest first)
  page: number; // current page (1-based)
  pageSize: number; // items per page
  total: number; // total submissions of user (after subject filter)
  totalPages: number; // Math.ceil(total / pageSize), min 1
}

/**
 * Lists the logged-in student's submission history (paginated, optional subject
 * filter). `subject` is a kebab slug (e.g. "math-methods"); the backend
 * normalizes it to the UPPERCASE subjectCode. apiGet attaches the Bearer token
 * automatically, so userId is NOT passed from the client.
 */
export function useStudentSubmissions(params: {
  page?: number;
  pageSize?: number;
  subject?: string;
}) {
  const { page = 1, pageSize = 10, subject } = params;
  return useQuery({
    queryKey: ["student", "submissions", "list", { page, pageSize, subject: subject ?? null }],
    queryFn: () => {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("pageSize", String(pageSize));
      if (subject) qs.set("subject", subject);
      return apiGet<StudentSubmissionsListResponse>(`/student/submissions?${qs.toString()}`);
    },
  });
}
