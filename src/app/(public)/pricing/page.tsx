import Navbar from '@/components/public/Navbar';
import PricingClient from '@/components/public/pricing/PricingClient';
import { getPlansSSR } from '@/lib/api/public-server';
import type { SubscriptionPlan } from '@/lib/api/billing';

export default async function PricingPage() {
  // Plans are public and near-static -> fetched server-side with ISR caching.
  const plans = await getPlansSSR().catch(() => [] as SubscriptionPlan[]);

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

        <PricingClient plans={plans} />
      </div>
    </div>
  );
}
