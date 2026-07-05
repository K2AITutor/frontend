export interface PlanLimits {
  questionsPerDay: number;
  aiExplanationsPerDay: number;
  examAccess: "limited" | "full";
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  stripePriceId: string | null;
  questionsPerDay: number;
  aiExplanationsPerDay: number;
  examAccess: string;
}

export interface SubscriptionStatus {
  hasSubscription: boolean;
  subscription?: {
    planId: number;
    planName: string;
    price: number;
    status: string;
    currentPeriodEnd: Date;
    stripeSubscriptionId: string;
    limits: PlanLimits;
  };
  message?: string;
}

export interface UsageStatus {
  questionsUsed: number;
  aiExplanationsUsed: number;
  limits: PlanLimits | null;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: Date;
  hostedInvoiceUrl: string;
  invoicePdf: string;
}
