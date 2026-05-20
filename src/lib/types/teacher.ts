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
