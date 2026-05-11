"use client";

import { useQuery } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
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

const mockTasks: ContributorTask[] = [
    {
        id: 101,
        type: "QUESTION_ENTRY",
        status: "TODO",
        priority: 3,
        title: "Enter VCAA Exam 1 Question 3a",
        description: "Create a draft question record with source metadata and answer type.",
        dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
        questionId: 3001,
    },
    {
        id: 102,
        type: "RUBRIC_BUILD",
        status: "IN_PROGRESS",
        priority: 2,
        title: "Build rubric for stationary points question",
        description: "Add 3 lightweight criteria and a model answer.",
        dueAt: new Date(Date.now() + 4 * 86400000).toISOString(),
        questionId: 3002,
    },
];

const mockRubricDrafts: ContributorRubricDraft[] = [
    {
        id: 5001,
        questionId: 3002,
        rubricKey: "mm_stationary_q1",
        maxMarks: 3,
        status: "DRAFT",
        updatedAt: new Date().toISOString(),
    },
];

function buildMockDashboard(): ContributorDashboardData {
    return {
        summary: {
            assignedTasks: mockTasks.length,
            todoTasks: mockTasks.filter((t) => t.status === "TODO").length,
            inReviewTasks: mockTasks.filter((t) => t.status === "IN_REVIEW").length,
            draftQuestions: 0,
            draftRubrics: mockRubricDrafts.filter((r) => r.status === "DRAFT").length,
        },
        recentTasks: mockTasks,
    };
}

export function useContributorDashboardData() {
    return useQuery({
        queryKey: ["contributorDashboard"],
        queryFn: async () => {
            const token = await getAccessToken();

            try {
                return await apiGet<ContributorDashboardData>("/contributor/dashboard", token);
            } catch {
                return buildMockDashboard();
            }
        },
        staleTime: 30_000,
    });
}

export function useContributorTasks() {
    return useQuery({
        queryKey: ["contributorTasks"],
        queryFn: async () => {
            const token = await getAccessToken();

            try {
                return await apiGet<ContributorTask[]>("/contributor/tasks/me", token);
            } catch {
                return mockTasks;
            }
        },
        staleTime: 30_000,
    });
}

export function useContributorRubricDrafts() {
    return useQuery({
        queryKey: ["contributorRubricDrafts"],
        queryFn: async () => {
            const token = await getAccessToken();
            return apiGet<ContributorRubricDraft[]>("/contributor/rubrics/mine", token);
        },
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
    return useQuery({
        queryKey: ["datasetQaQuestions", examKey],
        queryFn: async () => {
            const token = await getAccessToken();
            return apiGet<DatasetQaQuestion[]>(
                `/contributor/dataset-qa?examKey=${encodeURIComponent(examKey)}`,
                token
            );
        },
        enabled,
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
