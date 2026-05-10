import axios from 'axios';
import { getToken, clearToken } from './secureStore';
import { MOCK_STUDENT_DASHBOARD } from './mockData';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 10000,
});

// Toggle this for forced mock data during development
const USE_MOCKS = true;

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      await clearToken();
    }

    // DEV MODE: Mock interception if backend is unreachable or forced
    if (USE_MOCKS || !error.response) {
      console.warn(`[Dev Mode] Intercepting ${originalRequest.url} with mock data`);
      
      // Simulate real dashboard response
      if (originalRequest.url?.includes('/dashboard') || originalRequest.url?.includes('/auth/me')) {
        return { 
          data: MOCK_STUDENT_DASHBOARD, 
          status: 200, 
          statusText: 'OK', 
          headers: {}, 
          config: originalRequest 
        };
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
