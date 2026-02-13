// frontend/src/lib/examAttemptStore.ts

export type AttemptRecord = {
    examKey: string;
    questionId: number | string;
    questionNumber?: string | null;
    marks?: number | null;

    correct: boolean;
    score?: number | null;
    maxScore?: number | null;

    errorTags?: string[];
    skillGaps?: string[];

    submittedAt: string; // ISO
};

function key(examKey: string) {
    return `exam_attempts:${examKey}`;
}

export function loadExamAttempts(examKey: string): AttemptRecord[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(key(examKey));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveExamAttempt(examKey: string, rec: AttemptRecord) {
    if (typeof window === "undefined") return;
    const existing = loadExamAttempts(examKey);
    existing.push(rec);
    localStorage.setItem(key(examKey), JSON.stringify(existing));
}

export function clearExamAttempts(examKey: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key(examKey));
}

export function summarizeAttempts(attempts: AttemptRecord[]) {
    const total = attempts.length;
    const correct = attempts.filter(a => a.correct).length;
    const score = attempts.reduce((s, a) => s + (a.score ?? (a.correct ? (a.maxScore ?? 1) : 0)), 0);
    const maxScore = attempts.reduce((s, a) => s + (a.maxScore ?? 1), 0);

    const bySkill: Record<string, { total: number; incorrect: number }> = {};
    const byTag: Record<string, number> = {};

    for (const a of attempts) {
        for (const t of (a.errorTags ?? [])) {
            byTag[t] = (byTag[t] ?? 0) + 1;
        }

        for (const sk of (a.skillGaps ?? [])) {
            if (!sk) continue;
            bySkill[sk] ??= { total: 0, incorrect: 0 };
            bySkill[sk].total += 1;
            if (!a.correct) bySkill[sk].incorrect += 1;
        }
    }

    const weakSkills = Object.entries(bySkill)
        .map(([skill, v]) => ({
            skill,
            incorrect: v.incorrect,
            total: v.total,
            weakness: v.total ? v.incorrect / v.total : 0,
        }))
        .sort((a, b) => b.weakness - a.weakness || b.incorrect - a.incorrect)
        .slice(0, 12);

    const commonTags = Object.entries(byTag)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

    return { total, correct, score, maxScore, weakSkills, commonTags };
}
