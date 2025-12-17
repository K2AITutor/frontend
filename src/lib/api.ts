import axios from 'axios';

export async function apiGet(url: string, token?: string) {
    return axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

export async function apiPost(url: string, data: any, token?: string) {
    return axios.post(url, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}