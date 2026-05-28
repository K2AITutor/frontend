import type { PracticeQuestion } from "@/types/question";
import type { Testimonial } from "@/types/testimonial";
import type {
  TopicCountsDTO,
  SubmitAnswerResponse,
  AiExplainResponse,
  AiHintResponse,
  AiSimilarQuestionResponse,
  TopicProgressRow,
  ExamDTO,
  ExamQuestionDTO,
  Fetcher,
} from "@aitutor/shared";

export type {
  TopicCountsDTO,
  SubmitAnswerResponse,
  AiExplainResponse,
  AiHintResponse,
  AiSimilarQuestionResponse,
  TopicProgressRow,
  ExamDTO,
  ExamQuestionDTO,
};

export const webFetcher: Fetcher = {
  async get<T>(path: string, opts?: { signal?: AbortSignal }) {
    const base = getApiBase();
    const url = `${base}${path}`;
    const resolvedToken = await resolveBrowserSessionToken();

    const res = await fetch(url, {
      method: "GET",
      headers: buildHeaders(resolvedToken),
      credentials: "include",
      cache: "no-store",
      signal: opts?.signal,
    });

    return safeJsonFromResponse<T>(res, url);
  },
  async post<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }) {
    const base = getApiBase();
    const url = `${base}${path}`;
    const resolvedToken = await resolveBrowserSessionToken();

    const res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(resolvedToken),
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(body),
      signal: opts?.signal,
    });

    return safeJsonFromResponse<T>(res, url);
  },
  async put<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }) {
    const base = getApiBase();
    const url = `${base}${path}`;
    const resolvedToken = await resolveBrowserSessionToken();

    const res = await fetch(url, {
      method: "PUT",
      headers: buildHeaders(resolvedToken),
      credentials: "include",
      body: JSON.stringify(body),
      signal: opts?.signal,
    });

    return safeJsonFromResponse<T>(res, url);
  },
  async del<T>(path: string, opts?: { signal?: AbortSignal }) {
    const base = getApiBase();
    const url = `${base}${path}`;
    const resolvedToken = await resolveBrowserSessionToken();

    const res = await fetch(url, {
      method: "DELETE",
      headers: buildHeaders(resolvedToken),
      credentials: "include",
      signal: opts?.signal,
    });

    return safeJsonFromResponse<T>(res, url);
  },
};

export function getApiBase() {
  const raw =
    typeof window === "undefined"
      ? process.env.INTERNAL_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://aitutor-backend:4000/api"
      : process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

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

async function safeJsonFromResponse<T>(
  res: Response,
  urlForError: string
): Promise<T> {
  const text = await safeText(res);
  const trimmed = text.trim();

  if (!trimmed) {
    if (!res.ok) {
      throw new Error(
        `API ${res.status} ${res.statusText} (empty response) for ${urlForError}`
      );
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
    const msg =
      data?.message ||
      data?.error ||
      data?.detail ||
      `API ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}

async function resolveBrowserSessionToken(token?: string): Promise<string | undefined> {
  if (token || typeof window === "undefined") return token;

  try {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const session = await res.json();
    return session?.user?.accessToken || undefined;
  } catch {
    return undefined;
  }
}

function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const resolvedToken = await resolveBrowserSessionToken(token);

  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(resolvedToken),
    credentials: "include",
    cache: "no-store",
  });

  return safeJsonFromResponse<T>(res, url);
}

export async function apiPost<T>(path: string, body: any, token?: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const resolvedToken = await resolveBrowserSessionToken(token);

  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(resolvedToken),
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(body),
  });

  return safeJsonFromResponse<T>(res, url);
}

export async function apiPut<T>(path: string, body: any, token?: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: buildHeaders(token),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return safeJsonFromResponse<T>(res, url);
}

export async function apiPatch<T>(path: string, body: any, token?: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const resolvedToken = await resolveBrowserSessionToken(token);

  const res = await fetch(url, {
    method: "PATCH",
    headers: buildHeaders(resolvedToken),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return safeJsonFromResponse<T>(res, url);
}

export async function apiDelete<T>(path: string, token?: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders(token),
    credentials: "include",
  });
  return safeJsonFromResponse<T>(res, url);
}

export async function fetchExam(examKey: string, token?: string): Promise<ExamDTO> {
  return apiGet<ExamDTO>(`/exams/${encodeURIComponent(examKey)}`, token);
}

export async function fetchExamQuestionsByExamKey(
  examKey: string,
  token?: string
): Promise<ExamQuestionDTO[]> {
  return apiGet<ExamQuestionDTO[]>(
    `/exams/${encodeURIComponent(examKey)}/questions`,
    token
  );
}

export async function submitExamAnswer(payload: {
  examKey: string;
  questionId: number | string;
  answer: string;
  userId?: number;
  token?: string;
}): Promise<SubmitAnswerResponse> {
  const { examKey, questionId, answer, userId, token } = payload;

  return apiPost<SubmitAnswerResponse>(
    `/exams/${encodeURIComponent(examKey)}/submit`,
    {
      questionId: Number(questionId),
      answer,
      ...(typeof userId === "number" ? { userId } : {}),
    },
    token
  );
}

export async function fetchTopicCounts(subject: string): Promise<TopicCountsDTO> {
  const base = getApiBase();
  const url = `${base}/questions/topic-counts?subject=${encodeURIComponent(subject)}`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  return safeJsonFromResponse<TopicCountsDTO>(res, url);
}

export async function fetchPracticeQuestions(
  subject: string,
  topicCode: string
): Promise<PracticeQuestion[]> {
  const base = getApiBase();
  const url = `${base}/questions/practice?subject=${encodeURIComponent(
    subject
  )}&topicCode=${encodeURIComponent(topicCode)}`;

  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  return safeJsonFromResponse<PracticeQuestion[]>(res, url);
}

export async function fetchTopicProgress(
  subject: string,
  userId = 1
): Promise<TopicProgressRow[]> {
  const base = getApiBase();
  const url = `${base}/analytics/topic-progress?userId=${encodeURIComponent(
    String(userId)
  )}&subjectCode=${encodeURIComponent(subject)}`;

  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });

  return safeJsonFromResponse<TopicProgressRow[]>(res, url);
}

export async function submitAnswer(
  questionId: string,
  answer: string,
  examKey?: string,
  hintCount?: number,
  userId?: number
): Promise<SubmitAnswerResponse> {
  const base = getApiBase();
  const url = `${base}/questions/submit`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      questionId: Number(questionId),
      answer,
      userId: userId ?? 1,
      ...(examKey ? { examKey } : {}),
      ...(typeof hintCount === "number" ? { hintCount } : {}),
    }),
  });

  return safeJsonFromResponse<SubmitAnswerResponse>(res, url);
}

export async function getNextRecommendedQuestions(args: {
  subject: string;
  skillCode?: string;
  topicCode?: string;
  wasCorrect?: boolean;
  hintCount?: number;
  excludeQuestionId?: number | string;
  limit?: number;
}): Promise<PracticeQuestion[]> {
  const params = new URLSearchParams();
  params.set("subject", args.subject);
  if (args.skillCode) params.set("skillCode", args.skillCode);
  if (args.topicCode) params.set("topicCode", args.topicCode);
  if (typeof args.wasCorrect === "boolean") {
    params.set("wasCorrect", String(args.wasCorrect));
  }
  if (typeof args.hintCount === "number") {
    params.set("hintCount", String(args.hintCount));
  }
  if (args.excludeQuestionId != null) {
    params.set("excludeQuestionId", String(args.excludeQuestionId));
  }
  if (typeof args.limit === "number") {
    params.set("limit", String(args.limit));
  }

  const base = getApiBase();
  const url = `${base}/questions/recommend-next?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  return safeJsonFromResponse<PracticeQuestion[]>(res, url);
}

export async function getAdaptiveRecommendation(args: {
  subject: string;
  skillCode?: string;
  topicCode?: string;
  wasCorrect?: boolean;
  hintCount?: number;
  excludeQuestionId?: number | string;
  limit?: number;
}): Promise<PracticeQuestion[]> {
  return getNextRecommendedQuestions(args);
}

export async function aiExplain(payload: {
  subject: string;
  skillCode: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
}): Promise<AiExplainResponse> {
  return apiPost<AiExplainResponse>(`/ai-tutor/explain`, payload);
}

export async function aiHint(payload: {
  subject: string;
  skillCode: string;
  question: string;
  studentAnswer?: string;
  level: 1 | 2 | 3;
}): Promise<AiHintResponse> {
  return apiPost<AiHintResponse>(`/ai-tutor/hint`, payload);
}

export async function aiSimilarQuestion(payload: {
  subject: string;
  skillCode: string;
  question: string;
}): Promise<AiSimilarQuestionResponse> {
  return apiPost<AiSimilarQuestionResponse>(`/ai-tutor/similar`, payload);
}

export async function fetchSimilarQuestions(payload: {
  subject: string;
  questionId?: string;
  topicCode?: string;
  skillCode?: string;
  difficulty?: string;
  skillGaps?: string[];
  limit?: number;
}) {
  return apiPost<PracticeQuestion[]>(`/questions/similar`, payload);
}

export async function fetchTestimonials() {
  return apiGet<Testimonial[]>("/testimonials");
}
