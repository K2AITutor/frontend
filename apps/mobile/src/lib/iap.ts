import { Platform } from "react-native";
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Purchase,
} from "react-native-iap";
import { PATH } from "@aitutor/shared";
import apiClient from "./apiClient";

export const SUBSCRIPTION_SKUS = ["pro_monthly", "pro_annual"];

export async function initializeIap() {
  await initConnection();
  return () => {
    endConnection();
  };
}

export async function getSubscriptionProducts() {
  return fetchProducts({ skus: SUBSCRIPTION_SKUS, type: "subs" });
}

export async function requestSubscriptionPurchase(sku: string) {
  return requestPurchase({ request: { ios: { sku }, android: { skus: [sku] } }, type: "subs" } as any);
}

export async function restoreSubscriptionPurchases() {
  const purchases = await getAvailablePurchases();
  return Promise.all(purchases.map(verifyAndFinishPurchase));
}

async function verifyAndFinishPurchase(purchase: Purchase) {
  const productId = (purchase as any).productId;

  if (Platform.OS === "ios") {
    await apiClient.post(PATH.billing.iapAppleVerify, {
      receiptData: (purchase as any).transactionReceipt,
      sku: productId,
    });
  } else {
    await apiClient.post(PATH.billing.iapGoogleVerify, {
      purchaseToken: (purchase as any).purchaseToken,
      sku: productId,
    });
  }

  await finishTransaction({ purchase, isConsumable: false });
  return purchase;
}

export function listenForIapPurchases(onVerified: () => void, onError?: (error: unknown) => void) {
  const purchaseSub = purchaseUpdatedListener(async (purchase) => {
    try {
      await verifyAndFinishPurchase(purchase);
      onVerified();
    } catch (error) {
      onError?.(error);
    }
  });
  const errorSub = purchaseErrorListener((error) => onError?.(error));

  return () => {
    purchaseSub.remove();
    errorSub.remove();
  };
}
