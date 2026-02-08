import { z } from 'zod';

/**
 * Validation schema for updating user profile
 */
export const updateProfileSchema = z.object({
    fullName: z
        .string()
        .min(1, 'Full name is required')
        .max(50, 'Full name cannot exceed 50 characters')
        .optional(),
    phone: z
        .string()
        .regex(
            /^(0[3|5|7|8|9])+([0-9]{8})$/,
            'Please enter a valid Vietnam phone number (e.g., 0912345678)',
        )
        .max(15, 'Phone number cannot exceed 15 characters')
        .optional(),
    gender: z
        .enum(['MALE', 'FEMALE', 'OTHER'], {
            message: 'Gender must be MALE, FEMALE, or OTHER',
        })
        .optional(),
    address: z
        .object({
            lat: z.string(),
            lon: z.string(),
            displayName: z.string().max(200, 'Address cannot exceed 200 characters'),
            country: z.string(),
        })
        .nullable()
        .optional(),
    shortDescription: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Validation schema for updating password
 */
export const updatePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password is too long')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            ),
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword'],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
