"use client";

import { useQuery } from "@tanstack/react-query";
import { getSession, useSession } from "next-auth/react";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import type {
  ContributorTaskStatus,
  ContributorTaskType,
  ContributorTask,
  ContributorDashboardData,
  ContributorRubricDraft,
  RubricCriterionInput,
  CreateRubricDraftPayload,
  DatasetQaStatus,
  DatasetQaQuestion,
  UpdateDatasetQaPayload,
  DatasetQaMarkingResult,
} from "@aitutor/shared";

export type {
  ContributorTaskStatus,
  ContributorTaskType,
  ContributorTask,
  ContributorDashboardData,
  ContributorRubricDraft,
  RubricCriterionInput,
  CreateRubricDraftPayload,
  DatasetQaStatus,
  DatasetQaQuestion,
  UpdateDatasetQaPayload,
  DatasetQaMarkingResult,
};

async function getAccessToken() {
    const session = await getSession();
    return (session?.user as any)?.accessToken as string | undefined;
}

export function useContributorDashboardData() {
    const { data: session } = useSession();
    const token = (session?.user as any)?.accessToken as string | undefined;

    return useQuery({
        queryKey: ["contributorDashboard", token],
        queryFn: () => apiGet<ContributorDashboardData>("/contributor/dashboard", token),
        enabled: !!token,
        staleTime: 30_000,
    });
}

export function useContributorTasks() {
    const { data: session } = useSession();
    const token = (session?.user as any)?.accessToken as string | undefined;

    return useQuery({
        queryKey: ["contributorTasks", token],
        queryFn: () => apiGet<ContributorTask[]>("/contributor/tasks/me", token),
        enabled: !!token,
        staleTime: 30_000,
    });
}

export function useContributorRubricDrafts() {
    const { data: session } = useSession();
    const token = (session?.user as any)?.accessToken as string | undefined;

    return useQuery({
        queryKey: ["contributorRubricDrafts", token],
        queryFn: () => apiGet<ContributorRubricDraft[]>("/contributor/rubrics/mine", token),
        enabled: !!token,
        staleTime: 30_000,
    });
}

export async function getRubricByQuestionId(questionId: number | string) {
    const token = await getAccessToken();
    return apiGet(`/contributor/rubrics/question/${questionId}`, token);
}

export async function createRubricDraft(payload: CreateRubricDraftPayload) {
    const token = await getAccessToken();
    return apiPost("/contributor/rubrics", payload, token);
}

export async function updateRubricDraft(
    rubricId: number | string,
    payload: CreateRubricDraftPayload
) {
    const token = await getAccessToken();
    return apiPut(`/contributor/rubrics/${rubricId}`, payload, token);
}

export function useDatasetQaQuestions(examKey: string, enabled = true) {
    const { data: session } = useSession();
    const token = (session?.user as any)?.accessToken as string | undefined;

    return useQuery({
        queryKey: ["datasetQaQuestions", examKey, token],
        queryFn: () =>
            apiGet<DatasetQaQuestion[]>(
                `/contributor/dataset-qa?examKey=${encodeURIComponent(examKey)}`,
                token
            ),
        enabled: enabled && !!token,
        staleTime: 15_000,
    });
}

export async function updateDatasetQaQuestion(
    questionId: number | string,
    payload: UpdateDatasetQaPayload
) {
    const token = await getAccessToken();
    return apiPut<DatasetQaQuestion>(`/contributor/dataset-qa/${questionId}`, payload, token);
}

export async function testDatasetQaAnswer(questionId: number | string, answer: string) {
    const token = await getAccessToken();
    return apiPost<DatasetQaMarkingResult>(
        `/contributor/dataset-qa/${questionId}/test-answer`,
        { answer },
        token
    );
}
