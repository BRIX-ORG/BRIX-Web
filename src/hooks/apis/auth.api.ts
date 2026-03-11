import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn, signOut } from 'next-auth/react';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, providerMap } from '@/providers/firebase';
import type {
    RegisterRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponseData,
    VerifyOtpRequest,
    VerifyOtpResponseData,
    ResetPasswordRequest,
    ResetPasswordResponseData,
    LoginRequest,
    SendEmailVerificationRequest,
    SendEmailVerificationResponseData,
    VerifyEmailRequest,
    VerifyEmailResponseData,
    AuthResponseData,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

// Direct API calls (without auth interceptor for public endpoints)
const authApi = {
    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponseData>> => {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    },

    logout: async (refreshToken: string): Promise<void> => {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshToken}`,
            },
        });
    },

    forgotPassword: async (
        data: ForgotPasswordRequest,
    ): Promise<ApiResponse<ForgotPasswordResponseData>> => {
        const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to send recovery email');
        }
        return response.json();
    },

    verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponseData>> => {
        const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Invalid or expired OTP');
        }
        return response.json();
    },

    resetPassword: async (
        data: ResetPasswordRequest,
    ): Promise<ApiResponse<ResetPasswordResponseData>> => {
        const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to reset password');
        }
        return response.json();
    },

    // Email Verification - Send OTP
    sendEmailVerification: async (
        data: SendEmailVerificationRequest,
    ): Promise<ApiResponse<SendEmailVerificationResponseData>> => {
        const response = await fetch(`${API_BASE}/api/auth/verify-email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to send verification email');
        }
        return response.json();
    },

    // Email Verification - Verify OTP
    verifyEmail: async (
        data: VerifyEmailRequest,
    ): Promise<ApiResponse<VerifyEmailResponseData>> => {
        const response = await fetch(`${API_BASE}/api/auth/verify-email/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Invalid or expired verification code');
        }
        return response.json();
    },

    // Google auth - calls backend first to get proper error messages
    googleAuth: async (idToken: string) => {
        const response = await fetch(`${API_BASE}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Extract the actual error message from backend
            const errorMessage = data.message || data.error || 'Google authentication failed';
            throw new Error(errorMessage);
        }

        return data;
    },
};

// Register Hook - Call API then auto-login with NextAuth
export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: RegisterRequest) => {
            // Step 1: Call register API
            const response = await authApi.register(data);

            if (response.data) {
                // Step 2: Auto sign-in with NextAuth using credentials
                const signInResult = await signIn('credentials', {
                    redirect: false,
                    identifier: data.email,
                    password: data.password,
                });

                if (signInResult?.error) {
                    throw new Error('Registration successful but auto-login failed');
                }

                // Clear all cache on register
                queryClient.clear();
            }

            return response;
        },
    });
};

// Login Hook - Use NextAuth credentials provider
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            // Sign in with NextAuth using credentials
            // NextAuth will call authorize which calls backend and stores user + tokens
            const result = await signIn('credentials', {
                redirect: false,
                identifier: credentials.identifier,
                password: credentials.password,
            });

            if (result?.error) {
                throw new Error(
                    'Invalid credentials. Please check your email/username and password.',
                );
            }

            // Clear all cache on login
            queryClient.clear();

            return result;
        },
    });
};

// Logout Hook
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Sign out from NextAuth (clears session and user data)
            await signOut({ redirect: false });

            // Clear query cache
            queryClient.clear();
        },
    });
};

// Google Auth Hook - Firebase Popup Flow
// Step 1: Firebase popup -> idToken
// Step 2: Call backend /api/auth/google directly to get proper error messages
// Step 3: If successful, sign in with NextAuth to store session
export const useGoogleAuth = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Step 1: Open Firebase Google popup to get idToken
            const provider = providerMap.google;
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            // Step 2: Call backend API directly to get proper error messages
            // This will throw with the actual backend error message if it fails
            await authApi.googleAuth(idToken);

            // Step 3: If backend auth succeeded, sign in with NextAuth to create session
            const signInResult = await signIn('credentials', {
                redirect: false,
                idToken,
            });

            if (signInResult?.error) {
                // This shouldn't happen if backend already succeeded
                console.error(
                    '[useGoogleAuth] NextAuth session creation failed:',
                    signInResult.error,
                );
                throw new Error('Failed to create session');
            }

            if (!signInResult?.ok) {
                throw new Error('Google authentication failed');
            }

            // Clear all cache on Google auth
            queryClient.clear();

            return signInResult;
        },
    });
};

// Google Sign Out Hook
export const useGoogleSignOut = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Sign out from Firebase
            await firebaseSignOut(auth);

            // Sign out from NextAuth
            await signOut({ redirect: false });

            // Clear query cache
            queryClient.clear();
        },
    });
};

// Forgot Password Hook
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: authApi.forgotPassword,
    });
};

// Verify OTP Hook
export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: authApi.verifyOtp,
    });
};

// Reset Password Hook
export const useResetPassword = () => {
    return useMutation({
        mutationFn: authApi.resetPassword,
    });
};

// Send Email Verification Hook
export const useSendEmailVerification = () => {
    return useMutation({
        mutationFn: authApi.sendEmailVerification,
    });
};

// Verify Email Hook
export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: authApi.verifyEmail,
    });
};
