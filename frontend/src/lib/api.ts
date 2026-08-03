import axios, { AxiosError } from 'axios';
import type { ApiEnvelope } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'rollout.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; message?: string }>) => {
    if (error.response?.status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

/** Unwraps the { success, data } envelope every endpoint returns. */
function normalizeId<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeId(item)) as T;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(record)) {
      next[key] = normalizeId(nestedValue);
    }

    if (!next._id && typeof next.id === 'string') {
      next._id = next.id;
      delete next.id;
    }

    return next as T;
  }

  return value;
}

export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const res = await promise;
  return normalizeId(res.data.data);
}
