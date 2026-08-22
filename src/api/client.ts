import { clientEnv } from '../config/env';

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

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('barbershop_token');
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${clientEnv.apiUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor.');
  }

  const payload = (await response.json().catch(() => ({}))) as T & ErrorPayload;

  if (!response.ok) {
    if (response.status === 401 && token) {
      sessionStorage.removeItem('barbershop_token');
      sessionStorage.removeItem('barbershop_admin');
      window.dispatchEvent(new Event('barbershop:session-expired'));
    }
    throw new ApiError(
      response.status,
      payload.error?.code ?? 'REQUEST_ERROR',
      payload.error?.message ?? 'No se pudo completar la solicitud.',
      payload.error?.details,
    );
  }

  return payload;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
