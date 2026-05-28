export type ApiResponse<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: { code: string; message: string; details?: { field: string; constraints: string[] }[] };
};

class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `/api/backend/${path.replace(/^\//, '')}`;

  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, res.status);
  }

  return json.data;
}

export const api = {
  get:    <T>(path: string)                    => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown)    => request<T>('POST',   path, body),
  put:    <T>(path: string, body?: unknown)    => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body?: unknown)    => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                    => request<T>('DELETE', path),
};

export { ApiError };
