import { PracticeQuestion } from "@/types/question";

function getApiBase() {
  const raw =
    process.env.INTERNAL_API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:4000";

  const clean = String(raw).trim().replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function safeJsonFromResponse<T>(res: Response, urlForError: string): Promise<T> {
  const text = await safeText(res);
  const trimmed = text.trim();

  if (!trimmed) {
    if (!res.ok) {
      throw new Error(`API ${res.status} ${res.statusText} (empty response) for ${urlForError}`);
    }
    return {} as T;
  }

  let data: any;
  try {
    data = JSON.parse(trimmed);
  } catch {
    const snippet = trimmed.slice(0, 400);
    if (!res.ok) {
      throw new Error(
        `API ${res.status} ${res.statusText} returned non-JSON for ${urlForError}: ${snippet}`
      );
    }
    throw new Error(`API returned non-JSON for ${urlForError}: ${snippet}`);
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || data?.detail || `API ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
  });
  return safeJsonFromResponse<T>(res, url);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return safeJsonFromResponse<T>(res, url);
}

export async function submitAnswer(questionId: string, answer: string, examKey?: string) {
  const base = getApiBase();
  const url = `${base}/questions/submit`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      questionId: Number(questionId),
      answer,
      ...(examKey ? { examKey } : {}),
    }),
  });

  return safeJsonFromResponse(res, url);
}

export async function fetchPracticeQuestions(subject: string, topicCode: string): Promise<PracticeQuestion[]> {
  const base = getApiBase();
  const url = `${base}/questions/practice?subject=${encodeURIComponent(subject)}&topicCode=${encodeURIComponent(
    topicCode
  )}`;

  console.log("[apiClient] fetchPracticeQuestions", { url, subject, topicCode });

  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  return safeJsonFromResponse<PracticeQuestion[]>(res, url);
}

export async function aiExplain(payload: {
  subject: string;
  skillCode: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
}) {
  const base = getApiBase();
  const url = `${base}/ai-tutor/explain`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return safeJsonFromResponse(res, url);
}

export async function aiHint(payload: {
  subject: string;
  skillCode: string;
  question: string;
  studentAnswer?: string;
  level: 1 | 2 | 3;
}) {
  const base = getApiBase();
  const url = `${base}/ai-tutor/hint`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return safeJsonFromResponse(res, url);
}

export async function aiSimilarQuestion(payload: {
  subject: string;
  skillCode: string;
  question: string;
}) {
  const base = getApiBase();
  const url = `${base}/ai-tutor/similar`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return safeJsonFromResponse(res, url);
}

export async function fetchRecommendations(userId: number) {
  const base = getApiBase();
  const url = `${base}/recommendation/next?userId=${encodeURIComponent(String(userId))}`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  return safeJsonFromResponse(res, url) as Promise<PracticeQuestion[]>;
}

export async function getAdaptiveRecommendation(subject?: string) {
  const base = getApiBase();
  const url = `${base}/recommendations/adaptive${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  const res = await fetch(url, { credentials: "include" });
  return safeJsonFromResponse(res, url);
}

export type ExamDocumentDTO = {
  url?: string | null;
  filePath?: string | null;
};

export type ExamDTO = {
  examKey: string;
  title?: string | null;
  readingMins?: number | null;
  writingMins?: number | null;
  allowCAS?: boolean | null;
  showHints?: boolean | null;
  exactRequired?: boolean | null;
  workingRequired?: boolean | null;
  instructions?: string | null;
  pdf?: ExamDocumentDTO | null;
};

export type ExamQuestionDTO = {
  id: number;
  examKey: string;
  questionNumber: string;
  marks: number;
  answerType: string;
  prompt: string;
  skillCode?: string | null;
  pdfPage?: number | null;
  groupId?: number | null;
  partLabel?: string | null;
};

export async function fetchExam(examKey: string): Promise<ExamDTO> {
  const base = getApiBase();
  const url = `${base}/exams/${encodeURIComponent(examKey)}`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  return safeJsonFromResponse<ExamDTO>(res, url);
}

export async function fetchExamQuestionsByExamKey(examKey: string): Promise<ExamQuestionDTO[]> {
  const base = getApiBase();
  const url = `${base}/exams/${encodeURIComponent(examKey)}/questions`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  return safeJsonFromResponse<ExamQuestionDTO[]>(res, url);
}

export async function submitExamAnswer(args: {
  examKey: string;
  questionId: number | string;
  answer: string;
  userId?: number;
}) {
  const { examKey, questionId, answer, userId } = args;
  const base = getApiBase();
  const url = `${base}/exams/${encodeURIComponent(examKey)}/submit`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      questionId: Number(questionId),
      answer,
      ...(typeof userId === "number" ? { userId } : {}),
    }),
  });

  return safeJsonFromResponse(res, url);
}

export async function fetchSimilarQuestions(payload: {
  subject: string;
  questionId: string;
  skillGaps?: string[];
  limit?: number;
}) {
  return apiPost<PracticeQuestion[]>("/questions/similar", payload);
}