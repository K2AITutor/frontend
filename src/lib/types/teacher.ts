import type { ReviewQueueItem } from "@/lib/types/review";

export interface TeacherStats {
  queueDepth: number;
  reviewedToday: number;
  escalationRatePct: number;
  avgResolutionMinutes: number;
  agreementRatePct: number;
  agreementRatePct30d?: number;
}

export interface TeacherHistoryItem {
  id: string;
  submittedAt: string;
  decision: "approve" | "override" | "escalate";
  originalScore: number;
  correctedScore: number;
  agreementWithAi: boolean;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  pageSize: number;
}

// Decision string đã chuẩn hóa theo frontend (ACCEPT->approve, OVERRIDE->override, ESCALATE->escalate)
export type TeacherDecision = "approve" | "override" | "escalate";

export interface TeacherHistoryDetail {
  submission: {
    id: string; // String(attempt.id)
    submittedAt: string; // ISO — attempt.createdAt
    reviewedAt: string | null; // ISO — teacherCorrection.createdAt; null nếu chưa có correction
  };

  // Nhóm 4 — HS & ngữ cảnh
  student: {
    id: string; // String(attempt.userId ?? "")
    name: string; // firstName+lastName || email || "Unknown student"
  };
  context: {
    subject: string; // question.subjectCode (vd "MATH_METHODS"); "Unknown" nếu null
    questionType: string; // question.questionType ?? answerType ?? "Unknown"
    maxScore: number; // attempt.maxScore ?? question.marks ?? 1
    decision: TeacherDecision | null; // teacherCorrection.decision đã map; null nếu chưa review
  };

  // Nhóm 1 — Đề bài + đáp án
  question: {
    id: string; // String(question.id)
    questionText: string; // question.questionText
    studentAnswer: string; // attempt.answer
    correctAnswer: string | null; // question.correctAnswer (nullable — draft có thể chưa có)
  };

  // Nhóm 3 — AI chấm
  aiMarking: {
    aiScore: number; // điểm AI GỐC (originalScore nếu có correction, else attempt.score ?? 0)
    confidence: number; // 0..1, clamp; lấy như getConfidence()
    confidenceLevel: "high" | "medium" | "low"; // >=0.8 high, >=0.6 medium, else low
    routingReason: string; // confidence < 0.75 ? "low_confidence" : "auto_marked"
    aiErrorTags: string[]; // attempt.errorTags (mảng tag AI gợi ý); [] nếu rỗng
    aiExplanation: string | null; // attempt.aiExplanation; null nếu không có
  };

  // Nhóm 2 — Nhận xét & chỉnh sửa GV. null nếu submission CHƯA có teacherCorrection.
  correction: {
    correctedScore: number; // teacherCorrection.correctedScore
    originalScore: number; // teacherCorrection.originalScore (= điểm AI tại thời điểm review)
    comment: string | null; // teacherCorrection.comment
    teacherErrorTags: string[]; // teacherCorrection.errorTags; [] nếu rỗng
    criterionOverrides: CriterionOverride[]; // join với rubric criteria; [] nếu rỗng/rubric null
  } | null;

  // Rubric criteria (để hiển thị nhãn cho criterionOverrides). [] nếu rubric null.
  rubric: {
    criteria: RubricCriterionLite[];
  };
}

export interface RubricCriterionLite {
  id: string; // String(criterion.id)
  code: string; // criterion.criterionCode
  description: string; // criterion.description
  maxMarks: number; // criterion.marks
}

// criterionOverrides trong DB là Json dạng Record<criterionKey, number>.
// Backend JOIN key với rubric criteria để trả ra mảng có nhãn; key không khớp criterion
// vẫn trả với label = chính key đó (đừng bỏ sót dữ liệu GV đã nhập).
export interface CriterionOverride {
  criterionId: string; // key trong criterionOverrides (String). Nếu khớp criterion.id thì là id đó.
  label: string; // criterion.criterionCode nếu khớp; else = criterionId
  overrideScore: number; // giá trị điểm GV override (Number)
  maxMarks: number | null; // criterion.marks nếu khớp; null nếu key không khớp criterion nào
}
