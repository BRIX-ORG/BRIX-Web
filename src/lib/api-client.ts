import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

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

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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
                // Refresh failed, sign out
                useAuthStore.getState().signOut();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    },
);

// Function to refresh the access token
async function refreshAccessToken(): Promise<string | null> {
    try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
            useAuthStore.getState().signOut();
            return null;
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh-token`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        );

        if (!response.ok) {
            useAuthStore.getState().signOut();
            return null;
        }

        const data = (await response.json()) as RefreshTokenResponse;

        if (data.accessToken && data.refreshToken) {
            useAuthStore.getState().setAuth({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            return data.accessToken;
        }

        useAuthStore.getState().signOut();
        return null;
    } catch (error) {
        console.error('[REFRESH TOKEN] Error during refresh:', error);
        useAuthStore.getState().signOut();
        return null;
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
}
