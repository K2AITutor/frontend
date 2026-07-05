export interface Fetcher {
  get<T>(path: string, opts?: { signal?: AbortSignal }): Promise<T>;
  post<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }): Promise<T>;
  put<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }): Promise<T>;
  del<T>(path: string, opts?: { signal?: AbortSignal }): Promise<T>;
}
export interface Fetcher {
  get<T>(path: string, opts?: { signal?: AbortSignal }): Promise<T>;
  post<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }): Promise<T>;
  put<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }): Promise<T>;
  del<T>(path: string, opts?: { signal?: AbortSignal }): Promise<T>;
}
