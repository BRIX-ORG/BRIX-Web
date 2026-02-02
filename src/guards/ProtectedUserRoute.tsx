'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProtectedUserRouteProps {
    children: React.ReactNode;
}

/**
 * Protected route guard for USER role
 * - Redirects to login if not authenticated
 * - Redirects to verify-email page if email not verified (for LOCAL provider)
 * - Only allows USER role
 */
export function ProtectedUserRoute({ children }: ProtectedUserRouteProps) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        // Not authenticated - redirect to login
        if (!session) {
            router.push('/login');
            return;
        }

        // Wrong role - redirect to login
        if (session.user.role !== 'USER') {
            router.push('/login');
            return;
        }

        // Email not verified (only for LOCAL provider) - redirect to verify email
        if (session.user.provider === 'LOCAL' && !session.user.verifiedAt) {
            router.push('/verify-email');
            return;
        }
    }, [session, status, router]);

    // Still loading
    if (status === 'loading') {
        return null;
    }

    // Not authenticated or wrong role
    if (!session || session.user.role !== 'USER') {
        return null;
    }

    // Not verified (LOCAL provider only)
    if (session.user.provider === 'LOCAL' && !session.user.verifiedAt) {
        return null;
    }

    return <>{children}</>;
}
