import { z } from 'zod';

// Gender enum values
export const genderValues = ['MALE', 'FEMALE', 'OTHER'] as const;
export type GenderValue = (typeof genderValues)[number];

// Login Schema
export const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, 'Email or username is required')
        .refine(
            (val) => {
                // Accept either email format or username (alphanumeric with underscore)
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
                return emailRegex.test(val) || usernameRegex.test(val);
            },
            { message: 'Please enter a valid email or username' },
        ),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username cannot exceed 30 characters')
            .regex(
                /^(?!.*\.\.)(?!.*\.$)(?!^\.)([a-zA-Z0-9._]{3,30})$/,
                'Username can only contain letters, numbers, dots, and underscores. Dots cannot be at the start or end, or be consecutive.',
            ),
        fullName: z
            .string()
            .min(1, 'Full name is required')
            .max(50, 'Full name cannot exceed 50 characters'),
        email: z
            .string()
            .email('Please enter a valid email address')
            .max(100, 'Email cannot exceed 100 characters'),
        phone: z
            .string()
            .regex(
                /^(0[3|5|7|8|9])+([0-9]{8})$/,
                'Please enter a valid Vietnam phone number (e.g., 0912345678)',
            )
            .max(15, 'Phone number cannot exceed 15 characters')
            .optional()
            .or(z.literal('')),
        gender: z.enum(genderValues),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(
                /[!@#$%^&*(),.?":{}|<>]/,
                'Password must contain at least one special character',
            ),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Verify OTP Schema
export const verifyOtpSchema = z.object({
    otp: z
        .string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^[0-9]+$/, 'OTP can only contain digits'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(
                /[!@#$%^&*(),.?":{}|<>]/,
                'Password must contain at least one special character',
            ),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
