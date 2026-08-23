import { clientEnv } from '../config/env';
import type { Admin, ApiEnvelope } from '../types/api';

interface ErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface AuthSession {
  accessToken: string;
  admin: Admin;
}

let accessToken: string | null = null;
let refreshPromise: Promise<AuthSession> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

function sessionExpired(): void {
  accessToken = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('barbershop:session-expired'));
  }
}

async function responsePayload<T>(response: Response): Promise<T & ErrorPayload> {
  return (await response.json().catch(() => ({}))) as T & ErrorPayload;
}

function responseError(response: Response, payload: ErrorPayload): ApiError {
  return new ApiError(
    response.status,
    payload.error?.code ?? 'REQUEST_ERROR',
    payload.error?.message ?? 'No se pudo completar la solicitud.',
    payload.error?.details,
  );
}

async function requestRefresh(): Promise<AuthSession> {
  let response: Response;
  try {
    response = await fetch(`${clientEnv.apiUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-CSRF-Token': '1',
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor.');
  }

  const payload = await responsePayload<ApiEnvelope<AuthSession>>(response);
  if (!response.ok) throw responseError(response, payload);

  accessToken = payload.data.accessToken;
  return payload.data;
}

async function requestRefreshWithCrossTabLock(): Promise<AuthSession> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return await navigator.locks.request<Promise<AuthSession>>(
      'barbershop-refresh-session',
      requestRefresh,
    );
  }

  return requestRefresh();
}

export function refreshAccessToken(): Promise<AuthSession> {
  if (!refreshPromise) {
    const refresh = requestRefreshWithCrossTabLock();

    const pendingRefresh = refresh.finally(() => {
      refreshPromise = null;
    });
    refreshPromise = pendingRefresh;
    return pendingRefresh;
  }

  return refreshPromise;
}

const isSessionMutation = (path: string) =>
  path === '/auth/login' || path === '/auth/refresh' || path === '/auth/logout';

async function executeRequest<T>(path: string, init: RequestInit, canRefresh: boolean): Promise<T> {
  const tokenUsed = accessToken;
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (tokenUsed) headers.set('Authorization', `Bearer ${tokenUsed}`);

  let response: Response;
  try {
    response = await fetch(`${clientEnv.apiUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor.');
  }

  const payload = await responsePayload<T>(response);

  if (response.status === 401 && tokenUsed && canRefresh && !isSessionMutation(path)) {
    try {
      await refreshAccessToken();
      return executeRequest<T>(path, init, false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        sessionExpired();
        throw new ApiError(401, 'SESSION_EXPIRED', 'La sesión expiró. Inicia sesión nuevamente.');
      }
      throw error;
    }
  }

  if (!response.ok) {
    throw responseError(response, payload);
  }

  return payload;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  return executeRequest<T>(path, init, true);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
