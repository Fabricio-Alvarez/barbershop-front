import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiFetch, refreshAccessToken, setAccessToken } from './client';

const sessionPayload = {
  data: {
    accessToken: 'new-access-token',
    admin: { id: 'admin-id', name: 'Admin', email: 'admin@example.com' },
  },
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('authenticated API client', () => {
  afterEach(() => {
    setAccessToken(null);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('deduplicates simultaneous refresh requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sessionPayload));
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([refreshAccessToken(), refreshAccessToken()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first.accessToken).toBe('new-access-token');
    expect(second).toEqual(first);
  });

  it('refreshes once and retries an expired authenticated request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: 'INVALID_TOKEN', message: 'Token expirado' } }, 401),
      )
      .mockResolvedValueOnce(jsonResponse(sessionPayload))
      .mockResolvedValueOnce(jsonResponse({ data: { items: [] } }));
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('expired-access-token');

    const result = await apiFetch<{ data: { items: unknown[] } }>('/admin/appointments');

    expect(result.data.items).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const firstHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers as HeadersInit);
    const retryHeaders = new Headers(fetchMock.mock.calls[2]?.[1]?.headers as HeadersInit);
    expect(firstHeaders.get('Authorization')).toBe('Bearer expired-access-token');
    expect(retryHeaders.get('Authorization')).toBe('Bearer new-access-token');
  });
});
