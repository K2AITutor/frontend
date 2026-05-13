import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { PATH, type Fetcher, type LoginResponse } from "@aitutor/shared";
import { clearToken, getRefreshToken, getToken, saveTokens } from "./secureStore";
import { captureEvent } from "./observability";

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

const apiClient = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000/api",
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    (config as any).metadata = { startedAt: Date.now() };
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] = "en-AU";
    config.headers["X-Client-Platform"] = Platform.OS;
    config.headers["X-App-Version"] =
      Constants.expoConfig?.version || Constants.manifest?.version || "dev";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    const startedAt = (response.config as any).metadata?.startedAt;
    if (startedAt) {
      captureEvent("api_request_completed", {
        path: response.config.url,
        method: response.config.method,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        try {
          const response = await apiClient.post<LoginResponse>(PATH.auth.refresh, {
            refresh_token: refreshToken,
          });
          await saveTokens(response.data.access_token, response.data.refresh_token || refreshToken);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${response.data.access_token}`,
          };
          return apiClient(originalRequest);
        } catch {
          // Fall through to clear local auth state and let the app route to login.
        }
      }

      await clearToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);

export const mobileFetcher: Fetcher = {
  async get<T>(path: string, opts?: { signal?: AbortSignal }) {
    const response = await apiClient.get<T>(path, { signal: opts?.signal });
    return response.data;
  },
  async post<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }) {
    const response = await apiClient.post<T>(path, body, { signal: opts?.signal });
    return response.data;
  },
  async put<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }) {
    const response = await apiClient.put<T>(path, body, { signal: opts?.signal });
    return response.data;
  },
  async del<T>(path: string, opts?: { signal?: AbortSignal }) {
    const response = await apiClient.delete<T>(path, { signal: opts?.signal });
    return response.data;
  },
};

export default apiClient;
