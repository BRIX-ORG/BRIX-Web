'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface GuestRouteProps {
    children: React.ReactNode;
}

/**
 * Guest route guard for auth pages (login, signup, recovery)
 * - Redirects authenticated users to dashboard
 * - Only allows unauthenticated users to access auth pages
 */
export function GuestRoute({ children }: GuestRouteProps) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        // Already authenticated - redirect to dashboard
        if (session) {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    // Still loading
    if (status === 'loading') {
        return null;
    }

    // Already authenticated
    if (session) {
        return null;
    }

    return <>{children}</>;
}
