'use server';

import { unstable_update } from '@/lib/auth';
import type { User } from '@/types/auth.types';

/**
 * Server action to update NextAuth session with new tokens
 * Called after refresh token flow
 */
export async function updateSession(data: {
    user: User;
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
}) {
    try {
        await unstable_update({
            user: data.user,
            accessToken: data.accessToken,
            accessTokenExpiresAt: data.accessTokenExpiresAt,
            refreshToken: data.refreshToken,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to update session:', error);
        return { success: false, error: 'Failed to update session' };
    }
}

/**
 * Server action to update user profile in session
 * Call this when user updates avatar, display name, etc.
 */
export async function updateUserProfile(updates: Partial<User>) {
    try {
        // Get current session to merge updates
        const { auth } = await import('@/lib/auth');
        const session = await auth();

        if (!session?.user) {
            return { success: false, error: 'No active session' };
        }

        // Merge updates with existing user data
        const updatedUser = { ...session.user, ...updates };

        await unstable_update({
            user: updatedUser,
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return { success: false, error: 'Failed to update user profile' };
    }
}
