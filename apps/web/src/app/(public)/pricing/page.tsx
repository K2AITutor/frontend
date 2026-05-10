'use client';

import { useState, useEffect } from 'react';
import { fetchPlans, createCheckout, getSubscription, SubscriptionPlan, SubscriptionStatus } from '@/lib/api/billing';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/dashboard/ui/button';
import { cn } from '@/lib/utils';
import Navbar from '@/components/public/Navbar';

function getPlanFeatures(plan: SubscriptionPlan): string[] {
  const features: string[] = [];

  if (plan.questionsPerDay === -1) {
    features.push('Unlimited Practice Questions');
  } else {
    features.push(`${plan.questionsPerDay} Questions / Day`);
  }

  if (plan.aiExplanationsPerDay === -1) {
    features.push('Unlimited AI Explanations');
  } else {
    features.push(`${plan.aiExplanationsPerDay} AI Explanations / Day`);
  }

  if (plan.examAccess === 'full') {
    features.push('Full Exam Access');
  } else {
    features.push('Limited Exam Access');
  }

  features.push('Progress Tracking');

  if (plan.price > 0) {
    features.push('Priority Support');
  }

  return features;
}

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const accessToken = (session?.user as any)?.accessToken as string | undefined;

  useEffect(() => {
    async function init() {
      try {
        const [plansData, subscriptionData] = await Promise.all([
          fetchPlans(),
          session?.user?.id && accessToken
            ? getSubscription(Number(session.user.id), accessToken)
            : Promise.resolve(null)
        ]);

        setPlans(plansData);
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Failed to load pricing data:', error);
        setError("Failed to load plans. Please check your connection or try again later.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [session, accessToken]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!session?.user?.id || !accessToken) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    // Free plan doesn't need checkout
    if (plan.price === 0) {
      router.push('/student/subscription');
      return;
    }

    const userId = Number(session.user.id);

    setProcessing(plan.id);
    try {
      const { checkoutUrl } = await createCheckout(userId, plan.id, accessToken);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
      setProcessing(null);
    }
  };

  const isCanceling = subscription?.subscription?.status === 'canceling';

  const isCurrentPlan = (planId: number) => {
    if (isCanceling) return false;
    return subscription?.hasSubscription && subscription.subscription?.planId === planId;
  };

  const isUpgrade = (plan: SubscriptionPlan) => {
    if (!subscription?.hasSubscription) return true;
    return plan.price > (subscription.subscription?.price ?? 0);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-text-primary mb-6">
            Invest in Your Future
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your learning needs. Unlock unlimited practice, AI tutoring, and detailed analytics.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-teal"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <p className="text-text-secondary">No plans available at the moment.</p>
              </div>
            ) : (
              plans.map((plan) => {
                const isCurrent = isCurrentPlan(plan.id);
                const features = getPlanFeatures(plan);
                const isPro = plan.name.toLowerCase().includes('pro');

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative p-8 rounded-2xl border bg-bg-secondary transition-all duration-300 hover:shadow-xl",
                      isPro ? "border-accent-teal shadow-lg scale-105 z-10" : "border-border-subtle"
                    )}
                  >
                    {isPro && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-teal text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    )}

                    <h3 className="text-2xl font-serif text-text-primary mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-6">
                      <span className="text-4xl font-bold text-text-primary">
                        {plan.price === 0 ? 'Free' : `$${(plan.price / 100).toFixed(2)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-text-secondary ml-2">/month</span>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-teal/10 flex items-center justify-center">
                            <Check className="w-3 h-3 text-accent-teal" />
                          </div>
                          <span className="text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={processing === plan.id || isCurrent}
                      className={cn(
                        "w-full py-6 text-lg",
                        isCurrent
                          ? "bg-green-600 hover:bg-green-700 text-white cursor-default opacity-100"
                          : isPro
                            ? "bg-accent-teal hover:bg-accent-teal/90 text-white"
                            : "bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary"
                      )}
                    >
                      {processing === plan.id
                        ? 'Processing...'
                        : isCurrent
                          ? 'Current Plan'
                          : plan.price === 0
                            ? 'Get Started'
                            : isUpgrade(plan)
                              ? 'Upgrade Now'
                              : 'Subscribe Now'}
                    </Button>
                  </div>
                );
              }))}
          </div>
        )}
      </div>
    </div>
  );
}
