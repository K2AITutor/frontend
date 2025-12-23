import { apiPost } from "./apiClient";
import { saveToken, clearToken } from "./storage";

export async function login(email: string, password: string) {
    const res = await apiPost("/auth/signin", { email, password });
    if (res.access_token) saveToken(res.access_token);
    return res;
}

export async function register(email: string, password: string, name?: string) {
    return apiPost("/auth/signup", { email, password, name });
}

export function logout() {
    clearToken();
    window.location.href = "/auth/signin";
}
