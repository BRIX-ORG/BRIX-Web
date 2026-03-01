import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { updateSession } from '@/lib/auth-actions';
import type { RefreshResponse } from '@/types/auth.types';

// Create axios instance
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Store for tokens (will be set by client components)
let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

// Callback when session expires (refresh token invalid/expired)
let onSessionExpiredCallback: (() => void) | null = null;

export function setAccessToken(token: string | null) {
    cachedAccessToken = token;
}

export function setRefreshToken(token: string | null) {
    cachedRefreshToken = token;
}

export function setOnSessionExpired(callback: (() => void) | null) {
    onSessionExpiredCallback = callback;
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (cachedAccessToken && config.headers) {
            config.headers.Authorization = `Bearer ${cachedAccessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If not already refreshing, start the refresh process
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshAccessToken();
            }

            // Wait for the refresh to complete
            const newAccessToken = await refreshPromise;

            if (newAccessToken) {
                // Update the failed request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                // Retry the original request
                return apiClient(originalRequest);
            } else {
                // Refresh failed - force logout
                if (onSessionExpiredCallback) {
                    onSessionExpiredCallback();
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    },
);

// Function to refresh the access token
async function refreshAccessToken(): Promise<string | null> {
    try {
        if (!cachedRefreshToken) {
            return null;
        }

        // Call refresh endpoint with refresh token in Authorization header
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${cachedRefreshToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as RefreshResponse;

        if (data.data) {
            const {
                user,
                accessToken,
                accessTokenExpiresAt,
                refreshToken: newRefreshToken,
                refreshTokenExpiresAt,
            } = data.data;

            // Update cached tokens
            cachedAccessToken = accessToken;
            cachedRefreshToken = newRefreshToken;

            // Update NextAuth session with new tokens via server action
            await updateSession({
                user,
                accessToken,
                accessTokenExpiresAt,
                refreshToken: newRefreshToken,
                refreshTokenExpiresAt,
            });

            return accessToken;
        }

        return null;
    } catch (error) {
        console.error('[REFRESH TOKEN] Error during refresh:', error);
        return null;
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
}

// Helper function for creating API calls
export const createApiCall = <TResponse, TRequest = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
) => {
    return async (data?: TRequest): Promise<TResponse> => {
        const config: {
            method: string;
            url: string;
            data?: TRequest;
            params?: TRequest;
        } = {
            method,
            url,
            data: method !== 'GET' ? data : undefined,
            params: method === 'GET' ? data : undefined,
        };

        const response = await apiClient.request<TResponse>(config);
        return response.data;
    };
};
