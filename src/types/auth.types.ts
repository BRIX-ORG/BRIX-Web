// Gender type
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// API Response Wrapper
export interface ApiResponse<T> {
    message: string;
    code: number;
    data: T;
}

// User Model
export interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    gender: Gender;
    avatar: string;
    background: string;
    address: string;
    shortDescription: string;
    trustScore: number;
    role: 'USER' | 'ADMIN';
    provider: 'LOCAL' | 'GOOGLE';
    verifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

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

export type RegisterResponse = ApiResponse<AuthResponseData>;

// Login
export interface LoginRequest {
    identifier: string; // email or username
    password: string;
}

export type LoginResponse = ApiResponse<AuthResponseData>;

// Refresh Token
export type RefreshResponse = ApiResponse<AuthResponseData>;

// Logout
export interface LogoutResponseData {
    message: string;
}

export type LogoutResponse = ApiResponse<LogoutResponseData>;

// Google OAuth
export interface GoogleAuthRequest {
    idToken: string;
}

export type GoogleAuthResponse = ApiResponse<AuthResponseData>;

// Forgot Password
export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponseData {
    message: string;
}

export type ForgotPasswordResponse = ApiResponse<ForgotPasswordResponseData>;

// Verify OTP (Password Reset)
export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyOtpResponseData {
    resetToken: string;
}

export type VerifyOtpResponse = ApiResponse<VerifyOtpResponseData>;

// Reset Password
export interface ResetPasswordRequest {
    email: string;
    resetToken: string;
    newPassword: string;
}

export interface ResetPasswordResponseData {
    message: string;
}

export type ResetPasswordResponse = ApiResponse<ResetPasswordResponseData>;

// Email Verification - Send OTP
export interface SendEmailVerificationRequest {
    email: string;
}

export interface SendEmailVerificationResponseData {
    message: string;
}

export type SendEmailVerificationResponse = ApiResponse<SendEmailVerificationResponseData>;

// Email Verification - Verify OTP
export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface VerifyEmailResponseData {
    message: string;
}

export type VerifyEmailResponse = ApiResponse<VerifyEmailResponseData>;

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
        avatar: string;
        background: string;
        address: string;
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
            avatar: string;
            background: string;
            address: string;
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
