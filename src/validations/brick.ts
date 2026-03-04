import { z } from 'zod';

export const uploadArtBrickSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional()
        .or(z.literal('')),
    address: z
        .string()
        .max(200, 'Address must be at most 200 characters')
        .optional()
        .or(z.literal('')),
    latitude: z
        .number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .nullable()
        .optional(),
    longitude: z
        .number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .nullable()
        .optional(),
});

export type UploadArtBrickFormInput = z.infer<typeof uploadArtBrickSchema>;

export const uploadGlbBrickSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional()
        .or(z.literal('')),
    address: z
        .string()
        .max(200, 'Address must be at most 200 characters')
        .optional()
        .or(z.literal('')),
    latitude: z
        .number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .nullable()
        .optional(),
    longitude: z
        .number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .nullable()
        .optional(),
});

export type UploadGlbBrickFormInput = z.infer<typeof uploadGlbBrickSchema>;

// ─── Brick comment / reply ──────────────────────────────────────

export const createCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment is required')
        .max(2000, 'Comment must be at most 2000 characters'),
    parentId: z.string().uuid().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const editCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment is required')
        .max(2000, 'Comment must be at most 2000 characters'),
});

export type EditCommentInput = z.infer<typeof editCommentSchema>;

// ─── Brick metadata update ──────────────────────────────────────

export const updateBrickSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title must be at most 100 characters')
        .optional(),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional()
        .or(z.literal('')),
    isPublic: z.boolean().optional(),
});

export type UpdateBrickInput = z.infer<typeof updateBrickSchema>;

// ─── Realtime brick upload ──────────────────────────────────────

export const uploadRealtimeBrickSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional()
        .or(z.literal('')),
    address: z
        .string()
        .max(200, 'Address must be at most 200 characters')
        .optional()
        .or(z.literal('')),
    latitude: z
        .number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .nullable()
        .optional(),
    longitude: z
        .number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .nullable()
        .optional(),
    isPublic: z.boolean().optional(),
});

export type UploadRealtimeBrickFormInput = z.infer<typeof uploadRealtimeBrickSchema>;
