import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

// Full field set returned by GET /admin/questions/:id for the edit form.
export interface AdminQuestionDetail {
  id: number;
  subjectCode: string;
  topicId: number;
  topicCode: string;
  skillCode: string;
  subtopicCode: string | null;
  title: string | null;
  questionText: string;
  questionType: string | null;
  difficultyLevel: string | null;
  examStyleType: string | null;
  answerType: string;
  marks: number;
  isMarkable: boolean;
  correctAnswer: string | null;
  solutionSteps: unknown;
  misconceptions: unknown;
  tags: string[];
  status: string;
  sourceBook: string | null;
  sourceChapter: string | null;
  sourceSection: string | null;
  sourceExercise: string | null;
  sourceQuestionRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  subjectCode: string;
  topicCode: string;
  skillCode: string;
  subtopicCode?: string;
  title?: string;
  questionText: string;
  questionType?: string;
  difficultyLevel?: string;
  examStyleType?: string;
  answerType?: string;
  marks?: number;
  isMarkable?: boolean;
  correctAnswer?: string;
  /** Multiline string — one step per line. */
  solutionSteps?: string;
  /** Multiline string — one misconception per line. */
  misconceptions?: string;
  tags?: string[];
  status?: string;
  sourceBook?: string;
  sourceChapter?: string;
  sourceSection?: string;
  sourceExercise?: string;
  sourceQuestionRef?: string;
}

export type UpdateQuestionDto = Partial<CreateQuestionDto>;

export async function getQuestionForEdit(
  id: number,
  token: string
): Promise<AdminQuestionDetail> {
  return apiGet<AdminQuestionDetail>(`/admin/questions/${id}`, token);
}

export async function createQuestion(
  data: CreateQuestionDto,
  token: string
): Promise<AdminQuestionDetail> {
  return apiPost<AdminQuestionDetail>("/admin/questions", data, token);
}

export async function updateQuestion(
  id: number,
  data: UpdateQuestionDto,
  token: string
): Promise<AdminQuestionDetail> {
  return apiPut<AdminQuestionDetail>(`/admin/questions/${id}`, data, token);
}

export async function deleteQuestion(id: number, token: string): Promise<void> {
  return apiDelete<void>(`/admin/questions/${id}`, token);
}
