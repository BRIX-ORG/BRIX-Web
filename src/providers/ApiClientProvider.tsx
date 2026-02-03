'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setAccessToken, setRefreshToken } from '@/lib/api-client';

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        // Update apiClient with current tokens from session
        setAccessToken(session?.accessToken || null);
        setRefreshToken(session?.refreshToken || null);
    }, [session?.accessToken, session?.refreshToken]);

    return <>{children}</>;
}
