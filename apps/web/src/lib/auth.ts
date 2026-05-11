import type { LoginResponse } from "@aitutor/shared";
import { apiPost } from "./apiClient";
import { saveToken, clearToken, getToken } from "./storage";

export function getUserIdFromToken(): number | null {
    const token = getToken();
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.sub;
    } catch (e) {
        return null;
    }
}
export function getUserRoleFromToken(): string | null {
    const token = getToken();
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.role;
    } catch (e) {
        return null;
    }
}

export async function login(email: string, password: string) {
    const res = await apiPost<LoginResponse>("/auth/signin", { email, password });
    if (res.access_token) saveToken(res.access_token);
    return res;
}

export async function register(email: string, password: string, firstName: string, lastName: string, studentId?: string, yearLevel?: string) {
    return apiPost(
        "/auth/signup",
        {
            email,
            password,
            firstName,
            lastName,
            vcaaStudentNumber: studentId,
            yearLevel
        }
    );
}

export async function forgotPassword(email: string) {
    return apiPost<{ message: string }>("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string) {
    const res = await apiPost<LoginResponse & { message: string }>("/auth/reset-password", { token, password });
    if (res.access_token) saveToken(res.access_token);
    return res;
}

export function logout() {
    clearToken();
    window.location.href = "/auth/login";
}
