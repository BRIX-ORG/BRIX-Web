'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { setAccessToken, setRefreshToken, setOnSessionExpired } from '@/lib/api-client';

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();
    const isLoggingOut = useRef(false);

    // Handle session expired (refresh token invalid/expired)
    const handleSessionExpired = useCallback(async () => {
        // Prevent multiple simultaneous logout attempts
        if (isLoggingOut.current) return;
        isLoggingOut.current = true;

        try {
            // Clear tokens immediately
            setAccessToken(null);
            setRefreshToken(null);

            // Sign out from NextAuth (clears session)
            await signOut({ redirect: false });

            // Redirect to login
            router.push('/login');
        } catch (error) {
            console.error('[ApiClientProvider] Error during forced logout:', error);
        } finally {
            isLoggingOut.current = false;
        }
    }, [router]);

    // Register the session expired callback
    useEffect(() => {
        setOnSessionExpired(handleSessionExpired);

        return () => {
            setOnSessionExpired(null);
        };
    }, [handleSessionExpired]);

    useEffect(() => {
        // Update apiClient with current tokens from session
        setAccessToken(session?.accessToken || null);
        setRefreshToken(session?.refreshToken || null);
    }, [session?.accessToken, session?.refreshToken]);

    return <>{children}</>;
}
