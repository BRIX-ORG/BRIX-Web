import type { User, Gender, CloudinaryImage, UserAddress } from './user.types';
import type { ApiResponse } from './api.types';

// Re-export for convenience
export type { User, Gender, CloudinaryImage, UserAddress, ApiResponse };

// Auth Response Data (common for login, register, refresh, google)
export interface AuthResponseData {
    user: User;
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
}

// Register
export interface RegisterRequest {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    gender: Gender;
    password: string;
}

// Login
export interface LoginRequest {
    identifier: string; // email or username
    password: string;
}

// Refresh Token

// Logout
export interface LogoutResponseData {
    message: string;
}

// Google OAuth
export interface GoogleAuthRequest {
    idToken: string;
}

// Forgot Password
export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponseData {
    message: string;
}

// Verify OTP (Password Reset)
export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyOtpResponseData {
    resetToken: string;
}

// Reset Password
export interface ResetPasswordRequest {
    email: string;
    resetToken: string;
    newPassword: string;
}

export interface ResetPasswordResponseData {
    message: string;
}

// Email Verification - Send OTP
export interface SendEmailVerificationRequest {
    email: string;
}

export interface SendEmailVerificationResponseData {
    message: string;
}

// Email Verification - Verify OTP
export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface VerifyEmailResponseData {
    message: string;
}

// NextAuth Type Extensions
// These extend NextAuth's built-in types to include our custom fields
declare module 'next-auth' {
    interface User {
        id: string;
        username: string;
        fullName: string;
        email: string;
        phone: string;
        gender: Gender;
        avatar: CloudinaryImage | null;
        background: CloudinaryImage | null;
        address: UserAddress | null;
        shortDescription: string;
        trustScore: number;
        role: 'USER' | 'ADMIN';
        provider: 'LOCAL' | 'GOOGLE';
        verifiedAt: string | null;
        createdAt: string;
        updatedAt: string;
        accessToken?: string;
        accessTokenExpiresAt?: number;
        refreshToken?: string;
        refreshTokenExpiresAt?: number;
    }

    interface Session {
        user: User;
        accessToken: string;
        accessTokenExpiresAt: number;
        refreshToken: string;
        refreshTokenExpiresAt: number;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        user: {
            id: string;
            username: string;
            fullName: string;
            email: string;
            phone: string;
            gender: Gender;
            avatar: CloudinaryImage | null;
            background: CloudinaryImage | null;
            address: UserAddress | null;
            shortDescription: string;
            trustScore: number;
            role: 'USER' | 'ADMIN';
            provider: 'LOCAL' | 'GOOGLE';
            verifiedAt: string | null;
            createdAt: string;
            updatedAt: string;
        };
        accessToken: string;
        accessTokenExpiresAt: number;
        refreshToken: string;
        refreshTokenExpiresAt: number;
    }
}
