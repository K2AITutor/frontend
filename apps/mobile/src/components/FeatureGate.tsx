import React from "react";
import { useFeatureFlag, type FeatureFlagKey } from "../lib/featureFlags";

/**
 * Declaratively renders `children` only when `flag` resolves to enabled.
 * When disabled, renders `fallback` (nothing by default).
 *
 *   <FeatureGate flag="exams">
 *     <ExamCard />
 *   </FeatureGate>
 */
export function FeatureGate({
  flag,
  children,
  fallback = null,
}: {
  flag: FeatureFlagKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const enabled = useFeatureFlag(flag);
  return <>{enabled ? children : fallback}</>;
}
