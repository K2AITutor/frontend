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
