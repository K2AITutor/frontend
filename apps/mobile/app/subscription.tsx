import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { View, Text, ScrollView, Pressable, useCSSVariable } from "../src/tw";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, ShieldCheck } from "lucide-react-native";
import { Screen, ScreenHeader } from "../src/components/Screen";
import { useBillingPlans, useMySubscription, useUserProfile } from "@aitutor/shared";
import {
  getSubscriptionProducts,
  initializeIap,
  listenForIapPurchases,
  requestSubscriptionPurchase,
  restoreSubscriptionPurchases,
} from "../src/lib/iap";

export default function SubscriptionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const primary = useCSSVariable("--color-primary");
  const muted = useCSSVariable("--color-muted-foreground");
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [iapMessage, setIapMessage] = useState<string | null>(null);
  const { data: profile } = useUserProfile();
  const userId =
    typeof profile?.userId === "number"
      ? profile.userId
      : typeof profile?.id === "number"
        ? profile.id
        : undefined;
  const { data: plans = [], isLoading: isPlansLoading } = useBillingPlans();
  const { data: subscriptionStatus } = useMySubscription(userId);
  const activePlanId = subscriptionStatus?.subscription?.planId;

  useEffect(() => {
    let cleanupConnection: undefined | (() => void);
    const cleanupListeners = listenForIapPurchases(
      () => {
        setIapMessage("Purchase verified. Your subscription is active.");
        queryClient.invalidateQueries({ queryKey: ["billing"] });
      },
      () => setIapMessage("We could not verify the purchase. Please try restoring purchases.")
    );

    initializeIap()
      .then((cleanup) => {
        cleanupConnection = cleanup;
        return getSubscriptionProducts();
      })
      .then((products) => setStoreProducts((products || []) as any[]))
      .catch(() => setIapMessage("Store products are not available right now."));

    return () => {
      cleanupListeners();
      cleanupConnection?.();
    };
  }, [queryClient]);

  return (
    <Screen>
      <ScreenHeader title="Subscription" leftIcon={ChevronLeft} onLeftPress={() => router.back()} />

      <ScrollView className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-foreground mb-2">Upgrade Your Plan</Text>
          <Text className="text-muted-foreground">Unlock the full power of AI-driven VCE preparation.</Text>
        </View>

        <View className="space-y-6">
          {isPlansLoading && (
            <Text className="text-sm text-muted-foreground">Loading plans...</Text>
          )}
          {plans.map((plan) => {
            const active = plan.id === activePlanId || (!activePlanId && plan.price === 0);
            const recommended = plan.price > 0;
            const price = plan.price === 0 ? "$0" : `$${Number(plan.price).toFixed(2)}`;
            const sku = plan.stripePriceId || (plan.name.toLowerCase().includes("annual") ? "pro_annual" : "pro_monthly");
            const storeProduct = storeProducts.find((product) => product.id === sku || product.productId === sku);
            const features = [
              `${plan.questionsPerDay} questions / day`,
              `${plan.aiExplanationsPerDay} AI explanations / day`,
              `${plan.examAccess === "full" ? "Full" : "Limited"} exam access`,
            ];

            return (
            <View 
              key={plan.id}
              className={`bg-card p-6 rounded-3xl border ${recommended ? 'border-primary' : 'border-border'} shadow-lg mb-6`}
            >
              {recommended && (
                <View className="bg-primary self-start px-3 py-1 rounded-full mb-4">
                  <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Recommended</Text>
                </View>
              )}

              <View className="flex-row items-baseline justify-between mb-6">
                 <View>
                   <Text className="text-xl font-bold text-foreground">{plan.name}</Text>
                   <Text className="text-3xl font-black text-primary mt-1">{price}<Text className="text-sm font-medium text-muted-foreground">/mo</Text></Text>
                 </View>
                 {active && (
                   <View className="bg-emerald-500/10 px-3 py-1 rounded-lg">
                     <Text className="text-emerald-500 font-bold text-xs">Current Plan</Text>
                   </View>
                 )}
              </View>

              <View className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <View key={i} className="flex-row items-center">
                    <Check size={16} color={primary} />
                    <Text className="ml-3 text-text-secondary text-sm">{feature}</Text>
                  </View>
                ))}
              </View>

              <Pressable 
                className={`w-full py-4 rounded-2xl items-center justify-center ${active ? 'bg-muted' : 'bg-primary shadow-lg shadow-primary/20'}`}
                disabled={active}
                onPress={() => !active && requestSubscriptionPurchase(sku)}
              >
                <Text className={`${active ? 'text-muted-foreground' : 'text-white'} font-bold`}>
                  {active ? 'Active' : 'Upgrade Now'}
                </Text>
              </Pressable>
              {storeProduct?.displayPrice && (
                <Text className="mt-3 text-center text-xs text-muted-foreground">
                  Store price: {storeProduct.displayPrice}
                </Text>
              )}
            </View>
            );
          })}
        </View>

        {iapMessage && (
          <View className="mb-6 rounded-2xl border border-border bg-card p-4">
            <Text className="text-sm text-muted-foreground">{iapMessage}</Text>
          </View>
        )}

        <Pressable
          className="mb-6 w-full rounded-2xl border border-border bg-card py-4"
          onPress={() =>
            restoreSubscriptionPurchases()
              .then(() => {
                setIapMessage("Purchases restored.");
                queryClient.invalidateQueries({ queryKey: ["billing"] });
              })
              .catch(() => setIapMessage("No active purchases could be restored."))
          }
        >
          <Text className="text-center font-bold text-primary">Restore Purchases</Text>
        </Pressable>

        <View className="bg-card/50 p-6 rounded-3xl border border-dashed border-border items-center mb-10">
           <ShieldCheck size={32} color={muted} />
           <Text className="text-foreground font-bold mt-3">Secure Payment</Text>
           <Text className="text-muted-foreground text-xs text-center mt-1">Processed via Stripe. Cancel anytime.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
