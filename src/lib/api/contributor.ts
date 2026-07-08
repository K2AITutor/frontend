"use client";

import { useQuery } from "@tanstack/react-query";
import { getSession, useSession } from "next-auth/react";
import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/apiClient";

export type ContributorTaskStatus =
    | "TODO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE"
    | "BLOCKED";

export type ContributorTaskType =
    | "QUESTION_ENTRY"
    | "RUBRIC_BUILD"
    | "ANNOTATION"
    | "AI_QA"
    | "DATASET_CHECK";

export interface ContributorTask {
    id: number;
    type: ContributorTaskType;
    status: ContributorTaskStatus;
    priority: number;
    title: string;
    description?: string;
    dueAt?: string | null;
    questionId?: number | null;
}

export interface ContributorDashboardData {
    summary: {
        assignedTasks: number;
        todoTasks: number;
        inReviewTasks: number;
        draftQuestions: number;
        draftRubrics: number;
    };
    recentTasks: ContributorTask[];
}

export interface ContributorRubricDraft {
    id: number;
    questionId: number;
    rubricKey?: string | null;
    maxMarks: number;
    status: "DRAFT" | "REVIEW" | "ACTIVE" | "ARCHIVED";
    updatedAt?: string;
}

export interface RubricCriterionInput {
    criterionCode: string;
    description: string;
    marks: number;
    sortOrder: number;
}

export interface CreateRubricDraftPayload {
    questionId: number;
    rubricKey?: string;
    maxMarks: number;
    modelAnswer?: string;
    markingNotes?: string;
    commonErrors?: string[];
    criteria: RubricCriterionInput[];
}

export type DatasetQaStatus =
    | "READY_FOR_QA"
    | "APPROVED"
    | "NEEDS_FIX"
    | "REJECTED"
    | "MANUAL_REVIEW";

export type DatasetTrainingReadiness =
    | "PRACTICE_ONLY"
    | "TRAINING_READY"
    | "EXPERT_REVIEW";

export interface DatasetQaChecklist {
    sourceMatched: boolean;
    topicChecked: boolean;
    answerChecked: boolean;
    acceptedAnswersChecked: boolean;
    markerTestPassed: boolean;
    rubricChecked: boolean;
    solutionChecked: boolean;
}

export interface DatasetQaDataMapping {
    section: "A" | "B" | "unknown";
    profile: "multiple_choice" | "extended_response" | "unknown";
    status: "ready" | "needs_attention";
    summary: string;
    optionKeys?: string[];
    hasMultipleChoiceOptions?: boolean;
    hasCorrectAnswer?: boolean;
    hasMultipleChoiceMetadata?: boolean;
    hasLongAnswerFields?: boolean;
    missing?: string[];
}

export interface DatasetQaQuestion {
    id: number;
    examKey: string;
    questionNumber: string;
    questionText: string;
    topicCode?: string | null;
    subtopicCode?: string | null;
    skillCode?: string | null;
    marks: number;
    answerType: string;
    isMarkable: boolean;
    machineEngine?: string | null;
    correctAnswer: string;
    acceptedAnswers: string[];
    workedSolution: string;
    markingRubric: Array<{ marks?: number; criterion?: string }>;
    commonMistakes: string[];
    trainingReadiness: DatasetTrainingReadiness;
    qaChecklist: DatasetQaChecklist;
    lastMarkerTest?: DatasetQaMarkingResult | null;
    reviewStatus: DatasetQaStatus;
    reviewerName?: string;
    reviewerUserId?: number | null;
    reviewNotes?: string;
    reviewedAt?: string | null;
    publishedAt?: string | null;
    contentStatus?: "DRAFT" | "REVIEW" | "ACTIVE" | "ARCHIVED" | null;
    pdfPage?: number | null;
    dataMapping?: DatasetQaDataMapping | null;
}

export interface UpdateDatasetQaPayload {
    reviewerName: string;
    reviewStatus: DatasetQaStatus;
    reviewNotes?: string;
    questionText?: string;
    correctAnswer?: string;
    acceptedAnswers?: string[];
    workedSolution?: string;
    markingRubric?: Array<{ marks?: number; criterion?: string }>;
    commonMistakes?: string[];
    trainingReadiness?: DatasetTrainingReadiness;
    qaChecklist?: Partial<DatasetQaChecklist>;
    lastMarkerTest?: DatasetQaMarkingResult | null;
    topicCode?: string;
    subtopicCode?: string;
}

export interface DatasetQaMarkingResult {
    isCorrect: boolean | null;
    score: number | null;
    maxScore: number;
    errorTags: string[];
    diagnostics?: Record<string, unknown>;
}

export interface PublishDatasetQaResult {
    examKey: string;
    published: number;
    skipped: number;
    message: string;
}

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

export async function updateContributorTaskStatus(
    taskId: number | string,
    status: ContributorTaskStatus
) {
    const token = await getAccessToken();
    return apiPatch<ContributorTask>(`/contributor/tasks/${taskId}/status`, { status }, token);
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

export async function publishDatasetQaQuestions(examKey: string, questionIds?: number[]) {
    const token = await getAccessToken();
    return apiPost<PublishDatasetQaResult>(
        "/contributor/dataset-qa/publish",
        { examKey, questionIds },
        token
    );
}
