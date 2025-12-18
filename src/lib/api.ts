import axios from 'axios';

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export async function apiGet(path: string) {
    const res = await axios.get(`${API_BASE}${path}`);
    return res.data;
}

export async function apiPost(path: string, data: any) {
    const res = await axios.post(`${API_BASE}${path}`, data);
    return res.data;
}
