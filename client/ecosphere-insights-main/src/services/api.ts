import axios from "axios";

const baseURL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:5000/api";

export const api = axios.create({ baseURL, timeout: 10000 });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("ecosphere_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("ecosphere_token");
    }
    return Promise.reject(error);
  },
);

/**
 * Wrap a real API call with a mock fallback. If the backend is unreachable
 * (network error) or returns 404 for the endpoint, resolve with the mock
 * value so demos work standalone. Real errors (401, 400, 409) still surface.
 */
export async function withFallback<T>(
  real: () => Promise<T>,
  mock: () => T | Promise<T>,
): Promise<T> {
  try {
    return await real();
  } catch (err: any) {
    const status = err?.response?.status;
    const isNetwork = !err?.response;
    if (isNetwork || status === 404 || status === 501) {
      return await mock();
    }
    throw err;
  }
}

export function apiErrorMessage(err: unknown): string {
  const anyErr = err as any;
  return (
    anyErr?.response?.data?.error ||
    anyErr?.message ||
    "Something went wrong. Please try again."
  );
}