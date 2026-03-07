import { z } from 'zod';

// ─── Create Album ───────────────────────────────────────────────

export const createAlbumSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional()
        .or(z.literal('')),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;

// ─── Update Album Metadata ──────────────────────────────────────

export const updateAlbumSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be at most 100 characters')
        .optional(),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional()
        .or(z.literal('')),
    backgroundColor: z.string().optional(),
    titleColor: z.string().optional(),
    descriptionColor: z.string().optional(),
});

export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
