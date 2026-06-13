"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getSession, useSession } from "next-auth/react";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";

const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export type QuestionDraftDTO = {
  id: number;
  subjectCode?: string | null;
  topicCode?: string | null;
  skillCode?: string | null;
  questionText: string;
  answerType?: string | null;
  marks?: number | null;
  status: "DRAFT" | "REVIEW" | "ACTIVE" | "ARCHIVED";
  sourceBook?: string | null;
  sourceChapter?: string | null;
  sourceQuestionRef?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateQuestionDraftPayload = {
  subject?: string;
  subjectCode?: string;
  topicCode: string;
  skillCode: string;
  subtopicCode?: string;
  questionText: string;
  /** @deprecated legacy alias của questionText — backend vẫn nhận nhưng ưu tiên questionText */
  prompt?: string;
  answerType?: string;
  marks?: number;
  correctAnswer?: string;
  solutionSteps?: string;
  misconceptions?: string;
  sourceBook?: string;
  sourceChapter?: string;
  sourceSection?: string;
  sourceExercise?: string;
  sourceQuestionRef?: string;
  questionType?: string;
  difficultyLevel?: string;
  examStyleType?: string;
  tags?: string[];
};

export type UpdateQuestionDraftPayload = Partial<CreateQuestionDraftPayload>;

async function getAccessToken() {
  const session = await getSession();
  return (session?.user as any)?.accessToken as string | undefined;
}

export function usePracticeQuestions(topic: string) {
  return useQuery({
    queryKey: ["practiceQuestions", topic],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/questions/practice?topic=${encodeURIComponent(topic)}`,
        { cache: "no-store", credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch practice questions");
      return res.json();
    },
    enabled: !!topic,
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const res = await fetch(`${API_BASE}/questions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ questionId, answer }),
      });

      if (!res.ok) throw new Error("Submit failed");
      return res.json();
    },
  });
}

export function useContributorQuestionDrafts() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;

  return useQuery({
    queryKey: ["contributorQuestionDrafts", token],
    queryFn: () => apiGet<QuestionDraftDTO[]>("/questions/drafts/mine", token),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export async function createQuestionDraft(payload: CreateQuestionDraftPayload) {
  const token = await getAccessToken();
  return apiPost<QuestionDraftDTO>("/questions/drafts", payload, token);
}

export async function updateQuestionDraft(
  questionId: number | string,
  payload: UpdateQuestionDraftPayload
) {
  const token = await getAccessToken();
  return apiPut<QuestionDraftDTO>(`/questions/drafts/${questionId}`, payload, token);
}

export async function submitQuestionDraftForReview(questionId: number | string) {
  const token = await getAccessToken();
  return apiPost<{ id: number; status: string; updatedAt: string }>(
    `/questions/drafts/${questionId}/submit-review`,
    {},
    token
  );
}
