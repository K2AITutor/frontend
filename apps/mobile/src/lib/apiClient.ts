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
  (async (config: any) => {
    config.metadata = { startedAt: Date.now() };
    const token = await getToken();
    if (token === "mock-dev-token") {
      // Intercept and handle as mock request in response interceptor
      return Promise.reject({
        __isMockRequest: true,
        config,
      });
    }
    config.headers = config.headers || {};
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] = "en-AU";
    config.headers["X-Client-Platform"] = Platform.OS;
    config.headers["X-App-Version"] =
      Constants.expoConfig?.version || Constants.manifest?.version || "dev";
    return config;
  }) as any,
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
    if (error?.__isMockRequest) {
      const config = error.config;
      const url = config.url || "";
      console.log(`[Mock API] Intercepting request to: ${url}`);

      let data: any = {};

      if (url.includes("/auth/me")) {
        data = {
          id: 1,
          userId: 1,
          email: "student@aitutor.com.au",
          role: "STUDENT",
          firstName: "VCE",
          lastName: "Student",
          name: "VCE Student",
          profile: {
            id: "1",
            name: "VCE Student",
            email: "student@aitutor.com.au",
            avatar: "",
            grade: "Year 12",
            enrollmentDate: "2026-02-15",
            overallProgress: 75,
            streak: 5
          }
        };
      } else if (url.includes("/dashboard")) {
        data = {
          profile: {
            id: "1",
            name: "VCE Student",
            email: "student@aitutor.com.au",
            avatar: "",
            grade: "Year 12",
            enrollmentDate: "2026-02-15",
            overallProgress: 75,
            streak: 5
          },
          courses: [
            {
              id: "1",
              name: "Mathematical Methods",
              progress: 82,
              grade: "A+",
              nextLesson: "Quadratic Equations",
              icon: "BookOpen"
            },
            {
              id: "2",
              name: "Physics Unit 3 & 4",
              progress: 58,
              grade: "B",
              nextLesson: "Kinematics",
              icon: "Brain"
            }
          ],
          assignments: [
            {
              id: "a1",
              title: "Linear Models & Graphs Quiz",
              course: "Mathematical Methods",
              dueDate: "2026-06-05",
              status: "pending",
              priority: "high"
            },
            {
              id: "a2",
              title: "Newtonian Mechanics Worksheet",
              course: "Physics Unit 3 & 4",
              dueDate: "2026-06-10",
              status: "pending",
              priority: "medium"
            }
          ],
          recentActivities: [
            {
              id: "act1",
              type: "success",
              title: "Practice Completed",
              description: "Scored 92% in Quadratic Graphs",
              timestamp: "2 hours ago"
            },
            {
              id: "act2",
              type: "info",
              title: "Video Watched",
              description: "Completed introduction to kinematics",
              timestamp: "Yesterday"
            }
          ],
          stats: {
            totalHoursLearned: 38,
            questionsAnswered: 245,
            averageScore: 84,
            coursesEnrolled: 2,
            assignmentsCompleted: 12,
            assignmentsPending: 2
          }
        };
      } else if (url.includes("/subjects")) {
        data = [
          {
            id: 1,
            name: "Mathematical Methods",
            description: "VCE Maths Unit 3 & 4"
          },
          {
            id: 2,
            name: "Physics Unit 3 & 4",
            description: "Motion, gravity, and electromagnetism"
          }
        ];
      } else if (url.includes("/notifications")) {
        data = [
          {
            id: 1,
            type: "success",
            title: "Achievement Unlocked!",
            message: "You have maintained a 5-day study streak. Keep it up!",
            timestamp: "2 hours ago",
            isRead: false
          },
          {
            id: 2,
            type: "info",
            title: "New Assignment",
            message: "Linear Models & Graphs Quiz has been posted. Due in 5 days.",
            timestamp: "Yesterday",
            isRead: true
          }
        ];
      } else {
        data = { message: "Mock response", success: true };
      }

      return {
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    }

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
    const response = await apiClient.get<T>(path, { signal: opts?.signal } as any);
    return response.data;
  },
  async post<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }) {
    const response = await apiClient.post<T>(path, body, { signal: opts?.signal } as any);
    return response.data;
  },
  async put<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }) {
    const response = await apiClient.put<T>(path, body, { signal: opts?.signal } as any);
    return response.data;
  },
  async del<T>(path: string, opts?: { signal?: AbortSignal }) {
    const response = await apiClient.delete<T>(path, { signal: opts?.signal } as any);
    return response.data;
  },
};

export default apiClient;
