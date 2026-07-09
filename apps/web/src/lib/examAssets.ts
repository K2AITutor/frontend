import type {
  CropBoxRel,
  ExamQuestionAsset,
  ExamMeta,
} from "@aitutor/shared";

export type { CropBoxRel, ExamQuestionAsset, ExamMeta };

export async function fetchExamMeta(examKey: string): Promise<ExamMeta | null> {
  try {
    const res = await fetch(
      `/exams/${encodeURIComponent(examKey)}/meta.json`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const meta = (await res.json()) as ExamMeta;

    if (!meta?.examKey || !meta?.pdfUrl) return null;
    return meta;
  } catch {
    return null;
  }
}

export function resolveQuestionAsset(
  meta: ExamMeta | null,
  questionNumber: string | null | undefined
) {
  if (!meta) return null;
  const qn = (questionNumber ?? "").trim();
  const questions = meta.questions ?? {};
  if (qn && questions[qn]) return questions[qn];

  const leading = qn.match(/^\d+/)?.[0];
  if (leading && questions[leading]) return questions[leading];

  return null;
}
