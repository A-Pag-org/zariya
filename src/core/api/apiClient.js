import axios from "axios";
import { authApi } from "../auth/authApi";
import { tokenStorage } from "../auth/tokenStorage";

// Single Axios instance for the platform. Modules never import axios
// directly — they build repositories on top of this client, so auth headers,
// refresh handling and error normalization exist in exactly one place.

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" }
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // On 401, refresh once (deduplicated across concurrent requests) and retry.
    if (response?.status === 401 && !config._retried && tokenStorage.getRefreshToken()) {
      config._retried = true;
      refreshPromise ??= authApi
        .refresh(tokenStorage.getRefreshToken())
        .then((session) => {
          tokenStorage.setAccessToken(session.accessToken);
          tokenStorage.setRefreshToken(session.refreshToken);
          return session;
        })
        .finally(() => {
          refreshPromise = null;
        });

      try {
        await refreshPromise;
        return apiClient(config);
      } catch {
        tokenStorage.clear();
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error) {
  const normalized = new Error(
    error.response?.data?.message ?? error.message ?? "Something went wrong."
  );
  normalized.status = error.response?.status ?? null;
  normalized.cause = error;
  return normalized;
}
