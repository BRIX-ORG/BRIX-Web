import { z } from 'zod';

/** Schema for sending a text message */
export const sendMessageSchema = z.object({
    receiverId: z.string().uuid('Invalid receiver ID'),
    content: z
        .string()
        .max(5000, 'Message must be at most 5000 characters')
        .optional()
        .or(z.literal('')),
    brickId: z.string().uuid('Invalid brick ID').optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/** Schema for editing a message */
export const editMessageSchema = z.object({
    content: z
        .string()
        .min(1, 'Message content is required')
        .max(5000, 'Message must be at most 5000 characters'),
});

export type EditMessageInput = z.infer<typeof editMessageSchema>;

/** Schema for toggling a reaction */
export const toggleReactionSchema = z.object({
    emoji: z.string().min(1, 'Emoji is required').max(10, 'Invalid emoji'),
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;
