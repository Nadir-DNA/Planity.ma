/**
 * API test helpers for integration tests.
 *
 * Provides utilities for making HTTP requests to API routes
 * during integration testing.
 */

/**
 * Response type for API calls
 */
export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
  headers: Headers;
}

/**
 * Make an API request and return typed response.
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl =
    process.env.TEST_API_URL || "http://localhost:3000/api/v1";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  const response = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const body = (await response.json().catch(() => null)) as T;

  return {
    status: response.status,
    body,
    headers: response.headers,
  };
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(
  url: string,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  const queryString = params
    ? `?${new URLSearchParams(params).toString()}`
    : "";
  return apiRequest<T>(`${url}${queryString}`, { method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(
  url: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(
  url: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(
  url: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: "DELETE" });
}

/**
 * Build a URL with query parameters
 */
export function buildUrl(
  basePath: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params) return basePath;
  const query = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>
    )
  ).toString();
  return `${basePath}?${query}`;
}
