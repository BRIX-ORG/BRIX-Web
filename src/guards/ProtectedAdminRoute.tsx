'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

/**
 * Protected route guard for ADMIN role
 * Redirects to login if not authenticated or if role is not ADMIN
 */
export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'ADMIN') {
            router.push('/login');
        }
    }, [session, status, router]);

    if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
        return null;
    }

    return <>{children}</>;
}
