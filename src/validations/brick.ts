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
