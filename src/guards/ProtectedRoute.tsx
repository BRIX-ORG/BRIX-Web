'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Protected route guard for any authenticated user (both USER and ADMIN)
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
        }
    }, [session, status, router]);

    if (status === 'loading' || !session) {
        return null;
    }

    return <>{children}</>;
}
