import { PracticeQuestion } from "@/types/question";

function getApiBase() {
  const raw =
    typeof window === "undefined"
      ? process.env.INTERNAL_API_BASE ||
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://aitutor-backend:4000/api"
      : process.env.NEXT_PUBLIC_API_BASE ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "/api";

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
    const msg =
      data?.message ||
      data?.error ||
      data?.detail ||
      `API ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method: "GET",
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
    cache: "no-store",
    body: JSON.stringify(body),
  });

  return safeJsonFromResponse<T>(res, url);
}

export type TopicCountsDTO = {
  subject: string;
  counts: Record<string, number>;
};

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

export async function submitAnswer(
  questionId: string,
  answer: string,
  examKey?: string,
  hintCount?: number
) {
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
      ...(typeof hintCount === "number" ? { hintCount } : {}),
    }),
  });

  return safeJsonFromResponse(res, url);
}

export async function getNextRecommendedQuestions(args: {
  subject: string;
  skillCode?: string;
  topicCode?: string;
  wasCorrect?: boolean;
  hintCount?: number;
  excludeQuestionId?: number | string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  params.set("subject", args.subject);
  if (args.skillCode) params.set("skillCode", args.skillCode);
  if (args.topicCode) params.set("topicCode", args.topicCode);
  if (typeof args.wasCorrect === "boolean") params.set("wasCorrect", String(args.wasCorrect));
  if (typeof args.hintCount === "number") params.set("hintCount", String(args.hintCount));
  if (args.excludeQuestionId != null) params.set("excludeQuestionId", String(args.excludeQuestionId));
  if (typeof args.limit === "number") params.set("limit", String(args.limit));

  const base = getApiBase();
  const url = `${base}/questions/recommend-next?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  return safeJsonFromResponse<PracticeQuestion[]>(res, url);
}

/** Compatibility alias for existing PracticeClient import */
export async function getAdaptiveRecommendation(args: {
  subject: string;
  skillCode?: string;
  topicCode?: string;
  wasCorrect?: boolean;
  hintCount?: number;
  excludeQuestionId?: number | string;
  limit?: number;
}) {
  return getNextRecommendedQuestions(args);
}

export async function aiExplain(payload: {
  subject: string;
  skillCode: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
}) {
  return apiPost(`/ai-tutor/explain`, payload);
}

export async function aiHint(payload: {
  subject: string;
  skillCode: string;
  question: string;
  studentAnswer?: string;
  level: 1 | 2 | 3;
}) {
  return apiPost(`/ai-tutor/hint`, payload);
}

export async function aiSimilarQuestion(payload: {
  subject: string;
  skillCode: string;
  question: string;
}) {
  return apiPost(`/ai-tutor/similar`, payload);
}

export async function fetchSimilarQuestions(payload: {
  subject: string;
  questionId?: string;
  topicCode?: string;
  skillGaps?: string[];
  limit?: number;
}) {
  return apiPost<PracticeQuestion[]>(`/questions/similar`, payload);
}