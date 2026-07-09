import { Platform } from "react-native";
import { PATH } from "@aitutor/shared";
import apiClient from "./apiClient";

// Try to safely load the native IAP library. 
// In Expo Go, custom native code is not bundled, so we fallback to a developer mock.
let IAP: any = null;
try {
  IAP = require("react-native-iap");
} catch (e) {
  console.warn("[IAP] Native module is missing. Falling back to Developer Mock mode (Expo Go compatible).");
}

export const SUBSCRIPTION_SKUS = ["pro_monthly", "pro_annual"];

export async function initializeIap() {
  if (!IAP) {
    console.log("[IAP Mock] Initialized connection");
    return () => console.log("[IAP Mock] Ended connection");
  }
  await IAP.initConnection();
  return () => {
    IAP.endConnection();
  };
}

export async function getSubscriptionProducts() {
  if (!IAP) {
    console.log("[IAP Mock] Fetching subscription products");
    return SUBSCRIPTION_SKUS.map(sku => ({
      productId: sku,
      title: `${sku.replace("_", " ").toUpperCase()} Plan`,
      price: sku === "pro_monthly" ? "$29.00" : "$290.00",
      description: "Access to all study guides and practice exams",
    }));
  }
  return IAP.fetchProducts({ skus: SUBSCRIPTION_SKUS, type: "subs" });
}

export async function requestSubscriptionPurchase(sku: string) {
  if (!IAP) {
    console.log("[IAP Mock] Requesting purchase for:", sku);
    return { productId: sku, transactionId: "mock_transaction_id" };
  }
  return IAP.requestPurchase({ request: { ios: { sku }, android: { skus: [sku] } }, type: "subs" } as any);
}

export async function restoreSubscriptionPurchases() {
  if (!IAP) {
    console.log("[IAP Mock] Restoring purchases");
    return [];
  }
  const purchases = await IAP.getAvailablePurchases();
  return Promise.all(purchases.map(verifyAndFinishPurchase));
}

async function verifyAndFinishPurchase(purchase: any) {
  const productId = purchase.productId;

  if (Platform.OS === "ios") {
    await apiClient.post(PATH.billing.iapAppleVerify, {
      receiptData: purchase.transactionReceipt,
      sku: productId,
    });
  } else {
    await apiClient.post(PATH.billing.iapGoogleVerify, {
      purchaseToken: purchase.purchaseToken,
      sku: productId,
    });
  }

  if (IAP) {
    await IAP.finishTransaction({ purchase, isConsumable: false });
  }
  return purchase;
}

export function listenForIapPurchases(onVerified: () => void, onError?: (error: unknown) => void) {
  if (!IAP) {
    console.log("[IAP Mock] Listening for purchases");
    return () => console.log("[IAP Mock] Unsubscribed from purchase listeners");
  }
  const purchaseSub = IAP.purchaseUpdatedListener(async (purchase: any) => {
    try {
      await verifyAndFinishPurchase(purchase);
      onVerified();
    } catch (error) {
      onError?.(error);
    }
  });
  const errorSub = IAP.purchaseErrorListener((error: any) => onError?.(error));

  return () => {
    purchaseSub.remove();
    errorSub.remove();
  };
}

