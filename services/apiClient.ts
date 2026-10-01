import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/api";
import type { AuthRefreshResponse } from "@/interface/auth";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "@/services/tokenStorage";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(async (request) => {
  const token = await getAccessToken();

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

type RetriableRequest = InternalAxiosRequestConfig & { _authRetry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const request = error.config as RetriableRequest;
    if (request._authRetry || request.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    const currentToken = await getAccessToken();
    if (!currentToken) {
      return Promise.reject(error);
    }

    request._authRetry = true;

    try {
      const response = await apiClient.post<AuthRefreshResponse>("/auth/refresh");
      await saveAccessToken(response.data.access_token);
      request.headers.Authorization = `Bearer ${response.data.access_token}`;
      return await apiClient.request(request);
    } catch {
      await clearAccessToken();
      return Promise.reject(error);
    }
  },
);