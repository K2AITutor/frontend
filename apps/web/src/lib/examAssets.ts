export type CropBoxRel = [number, number, number, number];

export type ExamQuestionAsset = {
    page: number;                 // 1-based
    crop?: CropBoxRel;            // relative [x1,y1,x2,y2] in 0..1
};

export type ExamMeta = {
    examKey: string;
    title?: string;
    pdfUrl: string;               // public URL to PDF
    defaultPage?: number;
    questions?: Record<string, ExamQuestionAsset>;
};

export async function fetchExamMeta(examKey: string): Promise<ExamMeta | null> {
    try {
        const res = await fetch(`/exams/${encodeURIComponent(examKey)}/meta.json`, {
            cache: "no-store"
        });
        if (!res.ok) return null;
        const meta = (await res.json()) as ExamMeta;

        // minimal validation
        if (!meta?.examKey || !meta?.pdfUrl) return null;
        return meta;
    } catch {
        return null;
    }
}

export function resolveQuestionAsset(meta: ExamMeta | null, questionNumber: string | null | undefined) {
    if (!meta) return null;
    const qn = (questionNumber ?? "").trim();
    const questions = meta.questions ?? {};
    if (qn && questions[qn]) return questions[qn];

    // fallback: try leading digits (e.g., "2a" -> "2") if you store grouped crops
    const leading = qn.match(/^\d+/)?.[0];
    if (leading && questions[leading]) return questions[leading];

    return null;
}
