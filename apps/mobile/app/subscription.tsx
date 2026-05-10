import React from "react";
import { View, Text, ScrollView, Pressable } from "../src/tw";
import { useRouter } from "expo-router";
import { ChevronLeft, CreditCard, Check, Zap, ShieldCheck, TrendingUp } from "lucide-react-native";

export default function SubscriptionScreen() {
  const router = useRouter();

  const plans = [
    {
      id: 1,
      name: "Free",
      price: "$0",
      features: ["10 Questions / Day", "Basic AI Explanations", "Limited Exam Access"],
      active: true
    },
    {
      id: 2,
      name: "Pro",
      price: "$19.99",
      features: ["Unlimited Practice", "Detailed AI Tutoring", "Full Exam Access", "Priority Support"],
      active: false,
      recommended: true
    }
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-14 pb-6 px-6 bg-card border-b border-border flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#14b8a6" />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Subscription</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-foreground mb-2">Upgrade Your Plan</Text>
          <Text className="text-muted-foreground">Unlock the full power of AI-driven VCE preparation.</Text>
        </View>

        <View className="space-y-6">
          {plans.map((plan) => (
            <View 
              key={plan.id}
              className={`bg-card p-6 rounded-3xl border ${plan.recommended ? 'border-primary' : 'border-border'} shadow-lg mb-6`}
            >
              {plan.recommended && (
                <View className="bg-primary self-start px-3 py-1 rounded-full mb-4">
                  <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Recommended</Text>
                </View>
              )}

              <View className="flex-row items-baseline justify-between mb-6">
                 <View>
                   <Text className="text-xl font-bold text-foreground">{plan.name}</Text>
                   <Text className="text-3xl font-black text-primary mt-1">{plan.price}<Text className="text-sm font-medium text-muted-foreground">/mo</Text></Text>
                 </View>
                 {plan.active && (
                   <View className="bg-emerald-500/10 px-3 py-1 rounded-lg">
                     <Text className="text-emerald-500 font-bold text-xs">Current Plan</Text>
                   </View>
                 )}
              </View>

              <View className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <View key={i} className="flex-row items-center">
                    <Check size={16} color="#14b8a6" className="mr-3" />
                    <Text className="text-text-secondary text-sm">{feature}</Text>
                  </View>
                ))}
              </View>

              <Pressable 
                className={`w-full py-4 rounded-2xl items-center justify-center ${plan.active ? 'bg-muted' : 'bg-primary shadow-lg shadow-primary/20'}`}
                disabled={plan.active}
              >
                <Text className={`${plan.active ? 'text-muted-foreground' : 'text-white'} font-bold`}>
                  {plan.active ? 'Active' : 'Upgrade Now'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View className="bg-card/50 p-6 rounded-3xl border border-dashed border-border items-center mb-10">
           <ShieldCheck size={32} color="#94a3b8" />
           <Text className="text-foreground font-bold mt-3">Secure Payment</Text>
           <Text className="text-muted-foreground text-xs text-center mt-1">Processed via Stripe. Cancel anytime.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
