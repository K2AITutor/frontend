import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PATH } from "../constants/api";
import type { AiExplainResponse, AiHintResponse, AiSimilarQuestionResponse } from "../types/ai";
import type { SubmitAnswerResponse } from "../types/exam";
import type { PracticeQuestion } from "../types/practice";
import { useFetcher } from "./FetcherContext";

export interface PracticeQuestionParams {
  subject?: string;
  topicCode?: string;
  difficulty?: string;
}

export interface SubmitAnswerPayload {
  questionId: number | string;
  answer: string;
  subject?: string;
  topicCode?: string;
}

function toQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

export function usePracticeQuestion(params: PracticeQuestionParams) {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["practice", "question", params],
    enabled: Boolean(params.subject || params.topicCode),
    queryFn: ({ signal }) =>
      fetcher.get<PracticeQuestion>(
        `${PATH.questions.practice}${toQuery({
          subject: params.subject,
          topicCode: params.topicCode,
          difficulty: params.difficulty,
        })}`,
        { signal }
      ),
  });
}

export function useSubmitPracticeAnswer() {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAnswerPayload) =>
      fetcher.post<SubmitAnswerResponse>(PATH.questions.submit, payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ["practice"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "topicProgress", payload.subject] });
    },
  });
}

export function useAiHint() {
  const fetcher = useFetcher();

  return useMutation({
    mutationFn: (questionId: number | string) =>
      fetcher.post<AiHintResponse>(PATH.ai.hint, { questionId }),
  });
}

export function useAiExplanation() {
  const fetcher = useFetcher();

  return useMutation({
    mutationFn: (payload: { questionId: number | string; answer?: string }) =>
      fetcher.post<AiExplainResponse>(PATH.ai.explain, payload),
  });
}

export function useSimilarQuestion() {
  const fetcher = useFetcher();

  return useMutation({
    mutationFn: (questionId: number | string) =>
      fetcher.post<AiSimilarQuestionResponse>(PATH.ai.similar, { questionId }),
  });
}

export interface GradePhotoAnswerPayload {
  questionId?: number | string;
  image: string;
  subject?: string;
}

export function useGradePhotoAnswer() {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GradePhotoAnswerPayload) =>
      fetcher.post<any>(PATH.ai.explainPhoto, payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ["practice"] });
      if (payload.subject) {
        queryClient.invalidateQueries({ queryKey: ["analytics", "topicProgress", payload.subject] });
      }
    },
  });
}
