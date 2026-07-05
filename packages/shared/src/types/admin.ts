export interface AdminSubscriptionPlan {
  id: number;
  name: string;
  price: number;
  stripePriceId: string | null;
  questionsPerDay: number;
  aiExplanationsPerDay: number;
  examAccess: string;
  _count?: {
    subscriptions: number;
  };
}

export interface CreateSubscriptionPlanDto {
  name: string;
  price: number;
  stripePriceId?: string;
  questionsPerDay?: number;
  aiExplanationsPerDay?: number;
  examAccess?: string;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  price?: number;
  stripePriceId?: string;
  questionsPerDay?: number;
  aiExplanationsPerDay?: number;
  examAccess?: string;
}
