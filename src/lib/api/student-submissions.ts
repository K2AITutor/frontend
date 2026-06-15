"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import type { SubmissionFull } from "@/lib/types/marking";

export type StudentSubmissionResponse = SubmissionFull & {
  humanReviewPending: boolean;
  /** Student-facing tutoring feedback (aiExplanation); null when none. */
  feedback?: string | null;
};

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

export type SubmissionScoreFilter = "all" | "correct" | "partial" | "incorrect";

/**
 * Lists the logged-in student's submission history (paginated). All filtering is
 * server-side so totals/pagination stay consistent across pages:
 *  - `subject`  kebab slug (e.g. "math-methods"); backend → UPPERCASE subjectCode
 *  - `status`   one of SubmissionStatus (omit / "all" = no filter)
 *  - `score`    "correct" | "partial" | "incorrect" (omit / "all" = no filter)
 *  - `question` free-text search over question title + text
 *  - `dateRange` relative window "7d" | "30d" | "90d" (omit / "all" = no filter)
 * apiGet attaches the Bearer token automatically, so userId is NOT passed from
 * the client.
 */
export function useStudentSubmissions(params: {
  page?: number;
  pageSize?: number;
  subject?: string;
  status?: string;
  score?: string;
  question?: string;
  dateRange?: string;
}) {
  const { page = 1, pageSize = 10, subject, status, score, question, dateRange } = params;
  return useQuery({
    queryKey: [
      "student",
      "submissions",
      "list",
      {
        page,
        pageSize,
        subject: subject ?? null,
        status: status ?? null,
        score: score ?? null,
        question: question ?? null,
        dateRange: dateRange ?? null,
      },
    ],
    queryFn: () => {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("pageSize", String(pageSize));
      if (subject && subject !== "all") qs.set("subject", subject);
      if (status && status !== "all") qs.set("status", status);
      if (score && score !== "all") qs.set("score", score);
      if (question?.trim()) qs.set("question", question.trim());
      if (dateRange && dateRange !== "all") qs.set("dateRange", dateRange);
      return apiGet<StudentSubmissionsListResponse>(`/student/submissions?${qs.toString()}`);
    },
  });
}
