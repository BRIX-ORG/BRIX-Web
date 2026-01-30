import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn, signOut } from 'next-auth/react';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { createApiCall } from '@/lib/api-client';
import { auth, providerMap } from '@/providers/firebase';
import type {
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    GoogleAuthRequest,
    GoogleAuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
} from '@/types/auth.types';

// API Calls
const authApi = {
    register: createApiCall<RegisterResponse, RegisterRequest>('POST', '/api/auth/register'),
    login: createApiCall<LoginResponse, LoginRequest>('POST', '/api/auth/login'),
    logout: createApiCall<LogoutResponse>('POST', '/api/auth/logout'),
    googleAuth: createApiCall<GoogleAuthResponse, GoogleAuthRequest>('POST', '/api/auth/google'),
    forgotPassword: createApiCall<ForgotPasswordResponse, ForgotPasswordRequest>(
        'POST',
        '/api/auth/forgot-password',
    ),
    verifyOtp: createApiCall<VerifyOtpResponse, VerifyOtpRequest>('POST', '/api/auth/verify-otp'),
    resetPassword: createApiCall<ResetPasswordRequest, ResetPasswordResponse>(
        'POST',
        '/api/auth/reset-password',
    ),
};

// Register Hook
export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.register,
        onSuccess: async (response) => {
            if (response.data) {
                // Sign in with NextAuth to create session with tokens and user data
                await signIn('credentials', {
                    redirect: false,
                    identifier: response.data.user.email,
                });

                // Clear all cache on register
                queryClient.clear();
            }
        },
    });
};

// Login Hook
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
                throw new Error(result.error);
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
            // Call backend logout API
            await authApi.logout();

            // Sign out from NextAuth (clears session and user data)
            await signOut({ redirect: false });

            // Clear query cache
            queryClient.clear();
        },
    });
};

// Google Auth Hook - Firebase Popup Flow
// Backend xác thực Firebase idToken và trả về accessToken/refreshToken như local auth
export const useGoogleAuth = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Step 1: Open Firebase Google popup to get idToken
            const provider = providerMap.google;
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            // Step 2: Sign in with NextAuth credentials provider (use idToken)
            const signInResult = await signIn('credentials', {
                redirect: false,
                idToken,
            });

            if (signInResult?.error) {
                throw new Error(signInResult.error);
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

            // Call backend logout API
            await authApi.logout();

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
